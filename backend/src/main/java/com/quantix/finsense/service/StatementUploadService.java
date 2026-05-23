package com.quantix.finsense.service;

import com.quantix.finsense.dto.UploadResponse;
import com.quantix.finsense.entity.Transaction;
import com.quantix.finsense.entity.User;
import com.quantix.finsense.parser.ParsedTransaction;
import com.quantix.finsense.repository.TransactionRepository;
import com.quantix.finsense.repository.UserRepository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StatementUploadService {

    private final StatementParserService parserService;
    private final TransactionAnalysisService analysisService;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final String defaultUserEmail;

    public StatementUploadService(
            StatementParserService parserService,
            TransactionAnalysisService analysisService,
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            @Value("${finsense.default-user.email:demo@finsense.local}") String defaultUserEmail) {
        this.parserService = parserService;
        this.analysisService = analysisService;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.defaultUserEmail = defaultUserEmail;
    }

    @Transactional
    public UploadResponse process(MultipartFile file) {
        List<ParsedTransaction> parsed;
        try {
            parsed = parserService.parse(file);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read uploaded statement", ex);
        }

        if (parsed.isEmpty()) {
            return new UploadResponse("success", "Statement uploaded but no transactions were found");
        }

        User user = userRepository
                .findByEmail(defaultUserEmail)
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(defaultUserEmail)
                        .displayName("Demo User")
                        .build()));

      Set<String> hashes =
                parsed.stream().map(ParsedTransaction::transactionHash).collect(Collectors.toSet());
        Set<String> existingHashes = transactionRepository.findExistingHashes(hashes);
        List<ParsedTransaction> newTransactions = new ArrayList<>();
        for (ParsedTransaction item : parsed) {
            if (!existingHashes.contains(item.transactionHash())) {
                newTransactions.add(item);
            }
        }
        if (newTransactions.isEmpty()) {
            return new UploadResponse(
                    "success",
                    "Statement uploaded. All %d transactions were already present (duplicates skipped)."
                            .formatted(parsed.size()));
        }
        List<Transaction> transactions = newTransactions.stream()
                .map(p -> Transaction.builder()
                        .date(p.date())
                        .narration(p.narration())
                        .amount(p.amount())
                        .type(p.type())
                        .user(user)
                        .build())
                .toList();

        List<Transaction> categorized = analysisService.classifyTransactions(transactions).join();
        transactionRepository.saveAll(categorized);

        int skipped = parsed.size() - newTransactions.size();
        String suffix = skipped > 0 ? "Skipped %d duplicates.".formatted(skipped) : "";

        return new UploadResponse(
                "success",
                "Statement uploaded and processed. Saved %d categorized transactions.%s"
                        .formatted(categorized.size(), suffix));
    }
}
