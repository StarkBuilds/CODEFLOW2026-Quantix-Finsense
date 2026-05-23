package com.quantix.finsense.service;

import com.quantix.finsense.entity.Transaction;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

@Service
public class TransactionAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(TransactionAnalysisService.class);
    private static final String FALLBACK_CATEGORY = "Uncategorized";

    private static final ParameterizedTypeReference<List<String>> STRING_LIST =
            new ParameterizedTypeReference<>() {};

    private final WebClient mlWebClient;
    private final Duration classifyTimeout;

    public TransactionAnalysisService(
            WebClient mlWebClient,
            @Value("${finsense.ml.classify-timeout:30s}") Duration classifyTimeout) {
        this.mlWebClient = mlWebClient;
        this.classifyTimeout = classifyTimeout;
    }

    /**
     * Sends narrations to the Flask classifier and applies returned categories.
     * On ML failure, assigns {@value #FALLBACK_CATEGORY} so uploads still complete.
     */
    @Async
    public CompletableFuture<List<Transaction>> classifyTransactions(List<Transaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return CompletableFuture.completedFuture(Collections.emptyList());
        }

        List<String> narrations =
                transactions.stream().map(Transaction::getNarration).toList();

        try {
            List<String> categories = mlWebClient
                    .post()
                    .uri("/classify")
                    .bodyValue(narrations)
                    .retrieve()
                    .bodyToMono(STRING_LIST)
                    .block(classifyTimeout);

            if (categories == null || categories.size() != transactions.size()) {
                log.warn(
                        "ML service returned {} categories for {} transactions; using {}",
                        categories == null ? 0 : categories.size(),
                        transactions.size(),
                        FALLBACK_CATEGORY);
                applyFallbackCategory(transactions);
                return CompletableFuture.completedFuture(transactions);
            }

            for (int i = 0; i < transactions.size(); i++) {
                transactions.get(i).setCategory(categories.get(i));
            }
        } catch (WebClientException | IllegalStateException ex) {
            log.warn("ML classification unavailable ({}); using {}", ex.getMessage(), FALLBACK_CATEGORY);
            applyFallbackCategory(transactions);
        } catch (RuntimeException ex) {
            log.warn("ML classification failed; using {}", FALLBACK_CATEGORY, ex);
            applyFallbackCategory(transactions);
        }

        return CompletableFuture.completedFuture(transactions);
    }

    private void applyFallbackCategory(List<Transaction> transactions) {
        for (Transaction transaction : transactions) {
            transaction.setCategory(FALLBACK_CATEGORY);
        }
    }
}
