package com.quantix.finsense.service;

import com.quantix.finsense.dto.UploadResponse;
import com.quantix.finsense.entity.Transaction;
import com.quantix.finsense.entity.User;
import com.quantix.finsense.parser.ParsedTransaction;
import com.quantix.finsense.repository.TransactionRepository;
import com.quantix.finsense.security.CurrentUserService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StatementUploadService {

    private static final String UNCATEGORIZED = "Uncategorized";

    private final StatementParserService parserService;
    private final TransactionAnalysisService analysisService;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public StatementUploadService(
            StatementParserService parserService,
            TransactionAnalysisService analysisService,
            TransactionRepository transactionRepository,
            CurrentUserService currentUserService) {
        this.parserService = parserService;
        this.analysisService = analysisService;
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public UploadResponse process(MultipartFile file, String password) {
        List<ParsedTransaction> parsed;
        try {
            parsed = parserService.parse(file, password);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read uploaded statement", ex);
        }

        int parsedCount = parsed.size();
        if (parsed.isEmpty()) {
            return new UploadResponse(
                    "success", "Statement uploaded but no transactions were found", 0, 0, 0, 0);
        }

        User user = currentUserService.requireCurrentUser();

        Set<String> hashes =
                parsed.stream().map(ParsedTransaction::transactionHash).collect(Collectors.toSet());
        Set<String> existingHashes = transactionRepository.findExistingHashes(hashes);

        List<ParsedTransaction> newTransactions = new ArrayList<>();
        for (ParsedTransaction item : parsed) {
            if (!existingHashes.contains(item.transactionHash())) {
                newTransactions.add(item);
            }
        }

        int duplicateCount = parsedCount - newTransactions.size();
        if (newTransactions.isEmpty()) {
            return new UploadResponse(
                    "success",
                    "All transactions already exist (duplicates skipped).",
                    parsedCount,
                    0,
                    duplicateCount,
                    0);
        }

        List<Transaction> transactions = newTransactions.stream()
                .map(p -> Transaction.builder()
                        .date(p.date())
                        .narration(p.narration())
                        .amount(p.amount())
                        .type(p.type())
                        .transactionHash(p.transactionHash())
                        .user(user)
                        .build())
                .toList();

        List<Transaction> categorized = analysisService.classifyTransactions(transactions).join();
        transactionRepository.saveAll(categorized);

        int uncategorizedCount = (int) categorized.stream()
                .filter(t -> UNCATEGORIZED.equalsIgnoreCase(t.getCategory()))
                .count();

        return new UploadResponse(
                "success",
                "Statement processed successfully.",
                parsedCount,
                categorized.size(),
                duplicateCount,
                uncategorizedCount);
    }

    /** Backward-compatible overload without password. */
    @Transactional
    public UploadResponse process(MultipartFile file) {
        return process(file, null);
    }

    public Object getStatementSummaryFromFlask(MultipartFile file, String password) {
        // 1. Re-use your exact untouched parsing routine to get the transaction rows
        List<ParsedTransaction> parsed;
        try {
            parsed = parserService.parse(file, password);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read statement structures during summary generation", ex);
        }

        if (parsed.isEmpty()) {
            return java.util.Map.of("error", "No transactions found to summarize.");
        }

        // 2. Format the payload into a raw structure matching what app.py expects
        List<java.util.Map<String, Object>> flaskPayload = new ArrayList<>();
        for (ParsedTransaction pt : parsed) {
            java.util.Map<String, Object> txMap = new java.util.HashMap<>();
            txMap.put("date", pt.date() != null ? pt.date().toString() : "");
            txMap.put("narration", pt.narration() != null ? pt.narration() : "");
            txMap.put("amount", pt.amount() != null ? pt.amount().doubleValue() : 0.0);
            txMap.put("type", pt.type() != null ? pt.type().name() : "DEBIT");
            flaskPayload.add(txMap);
        }

        // 3. Dispatch the payload via Spring's standard RestTemplate client
        try {
            String flaskUrl = "http://localhost:5000/api/analyze";
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            org.springframework.http.HttpEntity<List<java.util.Map<String, Object>>> entity = 
                new org.springframework.http.HttpEntity<>(flaskPayload, headers);
            
            // Collect the composite response (XGBoost results + Gemini summary)
            return restTemplate.postForObject(flaskUrl, entity, Object.class);
        } catch (Exception e) {
            return java.util.Map.of(
                "error", "Flask connection failed",
                "message", e.getMessage()
            );
        }
    }
}
