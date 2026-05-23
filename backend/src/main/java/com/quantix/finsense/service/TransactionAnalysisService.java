package com.quantix.finsense.service;

import com.quantix.finsense.entity.Transaction;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class TransactionAnalysisService {

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
     * Sends narrations to the Flask classifier and applies returned categories to the
     * corresponding transactions (same list order). Runs on the async executor so HTTP
     * callers are not blocked for the full ML round-trip.
     */
    @Async
    public CompletableFuture<List<Transaction>> classifyTransactions(List<Transaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return CompletableFuture.completedFuture(Collections.emptyList());
        }

        List<String> narrations =
                transactions.stream().map(Transaction::getNarration).toList();

        List<String> categories = mlWebClient
                .post()
                .uri("/classify")
                .bodyValue(narrations)
                .retrieve()
                .bodyToMono(STRING_LIST)
                .block(classifyTimeout);

        if (categories == null || categories.size() != transactions.size()) {
            throw new IllegalStateException(
                    "ML service returned %d categories for %d transactions"
                            .formatted(
                                    categories == null ? 0 : categories.size(),
                                    transactions.size()));
        }

        for (int i = 0; i < transactions.size(); i++) {
            transactions.get(i).setCategory(categories.get(i));
        }

        return CompletableFuture.completedFuture(transactions);
    }
}
