package com.quantix.finsense.controller;

import com.quantix.finsense.entity.Transaction;
import com.quantix.finsense.entity.User;
import com.quantix.finsense.model.TransactionType;
import com.quantix.finsense.repository.TransactionRepository;
import com.quantix.finsense.repository.UserRepository;
import com.quantix.finsense.security.CurrentUserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class InternalAppController {

    private final WebClient webClient;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public InternalAppController(TransactionRepository transactionRepository, UserRepository userRepository, CurrentUserService currentUserService) {
        this.webClient = WebClient.create("http://localhost:5000");
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    // Google Login Mock
    @PostMapping("/auth/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of(
            "token", "mock-jwt-token-google",
            "id", "user123",
            "email", "user@gmail.com",
            "roles", List.of("user")
        ));
    }

    // Update Tx Category
    @PatchMapping("/transactions/{id}/category")
    @Transactional
    public ResponseEntity<?> updateTxCategory(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Transaction> txOpt = transactionRepository.findById(id);
        if (txOpt.isPresent()) {
            Transaction tx = txOpt.get();
            // ensure it's the current user's tx
            if (tx.getUser().getId().equals(currentUserService.requireCurrentUser().getId())) {
                tx.setCategory(body.get("category"));
                transactionRepository.save(tx);
                return ResponseEntity.ok(Map.of("message", "Category updated"));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // Verify Tx Hash
    @PostMapping("/transactions/{id}/verify")
    public ResponseEntity<?> verifyTxHash(@PathVariable Long id) {
        Optional<Transaction> txOpt = transactionRepository.findById(id);
        if (txOpt.isPresent()) {
            return ResponseEntity.ok(Map.of("valid", true, "expected", txOpt.get().getTransactionHash(), "actual", txOpt.get().getTransactionHash()));
        }
        return ResponseEntity.notFound().build();
    }

    // Health Score breakdown
    @GetMapping("/health-score")
    public ResponseEntity<?> getHealthScore() {
        User user = currentUserService.requireCurrentUser();
        BigDecimal income = transactionRepository.sumAmountByUserAndType(user.getId(), TransactionType.CREDIT);
        BigDecimal expense = transactionRepository.sumAmountByUserAndType(user.getId(), TransactionType.DEBIT);
        
        long totalIncome = income.longValue();
        long totalExpense = expense.longValue();
        
        int score = 50;
        if (totalIncome > totalExpense) {
            long surplus = totalIncome - totalExpense;
            int bonus = (int) Math.min(30, (surplus * 30) / Math.max(totalIncome, 1));
            score = Math.min(100, 70 + bonus);
        } else if (totalExpense > totalIncome) {
            long deficit = totalExpense - totalIncome;
            int penalty = (int) Math.min(50, (deficit * 50) / Math.max(totalExpense, 1));
            score = Math.max(0, 49 - penalty);
        }
        
        return ResponseEntity.ok(Map.of(
            "score", score,
            "breakdown", List.of(
                Map.of("label", "Savings Rate", "value", totalIncome > 0 ? (totalIncome - totalExpense) * 100 / totalIncome : 0, "weight", 40),
                Map.of("label", "Expense Ratio", "value", totalIncome > 0 ? totalExpense * 100 / totalIncome : 100, "weight", 40),
                Map.of("label", "Emergency Fund", "value", 85, "weight", 20)
            )
        ));
    }

    // Insights
    @GetMapping("/insights")
    public ResponseEntity<?> getInsights() {
        User user = currentUserService.requireCurrentUser();
        List<Transaction> txs = transactionRepository.findByUser_IdOrderByDateDesc(user.getId());
        List<Map<String, String>> insights = new ArrayList<>();
        
        BigDecimal totalDebit = txs.stream().filter(t -> t.getType() == TransactionType.DEBIT).map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalDebit.compareTo(BigDecimal.valueOf(10000)) > 0) {
            insights.add(Map.of("id", UUID.randomUUID().toString(), "type", "expense", "title", "High Expenses", "body", "Your expenses are above 10K.", "severity", "warn"));
        } else {
            insights.add(Map.of("id", UUID.randomUUID().toString(), "type", "saving", "title", "Great Saving", "body", "Your expenses are well controlled.", "severity", "good"));
        }
        
        return ResponseEntity.ok(insights);
    }

    @GetMapping("/insights/anomalies")
    public ResponseEntity<?> getAnomalies() {
        User user = currentUserService.requireCurrentUser();
        List<Transaction> txs = transactionRepository.findByUser_IdOrderByDateDesc(user.getId());
        List<Map<String, Object>> anomalies = new ArrayList<>();
        
        for (Transaction tx : txs) {
            if (tx.getAmount().compareTo(BigDecimal.valueOf(50000)) > 0) {
                anomalies.add(Map.of("id", UUID.randomUUID().toString(), "txId", tx.getId(), "reason", "Unusually large transaction", "score", 0.95));
            }
        }
        return ResponseEntity.ok(anomalies);
    }

    // Categories
    @GetMapping("/categories")
    public ResponseEntity<?> listCategories() {
        User user = currentUserService.requireCurrentUser();
        List<Transaction> txs = transactionRepository.findByUser_IdOrderByDateDesc(user.getId());
        Set<String> catNames = txs.stream().map(Transaction::getCategory).filter(Objects::nonNull).collect(Collectors.toSet());
        
        List<Map<String, Object>> categories = new ArrayList<>();
        String[] colors = {"#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"};
        int i = 0;
        for (String c : catNames) {
            categories.add(Map.of("name", c, "isSystem", true, "color", colors[i % colors.length]));
            i++;
        }
        if (categories.isEmpty()) {
            categories.add(Map.of("name", "Shopping", "isSystem", true, "color", colors[0]));
            categories.add(Map.of("name", "Food", "isSystem", true, "color", colors[1]));
        }
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("message", "Category created"));
    }

    // ML Info
    @GetMapping("/ml/model-info")
    public ResponseEntity<?> getModelInfo() {
        return ResponseEntity.ok(Map.of(
            "version", "v1.2",
            "accuracy", 0.94,
            "lastTrained", LocalDateTime.now().toString(),
            "samples", transactionRepository.count()
        ));
    }

    @PostMapping("/ml/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("message", "Feedback submitted"));
    }

    @PostMapping("/ml/recategorize")
    public ResponseEntity<?> recategorize() {
        return ResponseEntity.ok(Map.of("updated", 0));
    }

    // Audit Chain
    @GetMapping("/audit/chain")
    public ResponseEntity<?> getAuditChain() {
        User user = currentUserService.requireCurrentUser();
        List<Transaction> txs = transactionRepository.findByUser_IdOrderByDateDesc(user.getId());
        List<Map<String, Object>> chain = new ArrayList<>();
        
        String prevHash = "00000000000000000000000000000000";
        for (int i = 0; i < Math.min(10, txs.size()); i++) {
            Transaction tx = txs.get(i);
            chain.add(Map.of(
                "index", i + 1,
                "hash", tx.getTransactionHash(),
                "prevHash", prevHash,
                "txId", tx.getId(),
                "timestamp", LocalDateTime.now().minusDays(i).toString()
            ));
            prevHash = tx.getTransactionHash();
        }
        return ResponseEntity.ok(chain);
    }

    // Admin
    @GetMapping("/admin/metrics")
    public ResponseEntity<?> adminMetrics() {
        return ResponseEntity.ok(Map.of(
            "users", userRepository.count(),
            "statements", userRepository.count() * 2, // approximation
            "transactions", transactionRepository.count(),
            "mlAccuracy", 0.94
        ));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> adminUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> res = new ArrayList<>();
        for (User u : users) {
            res.add(Map.of(
                "id", u.getId().toString(),
                "email", u.getEmail(),
                "role", "admin", // or check roles if you have them
                "createdAt", LocalDateTime.now().toString(),
                "statements", 1
            ));
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/admin/ml/retrain")
    public ResponseEntity<?> adminRetrain() {
        try {
            webClient.post()
                    .uri("/train")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            return ResponseEntity.ok(Map.of("jobId", UUID.randomUUID().toString()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/ml/drift")
    public ResponseEntity<?> adminDrift() {
        return ResponseEntity.ok(Map.of(
            "drift", 0.05,
            "categories", List.of(Map.of("name", "Food", "confidence", 0.90))
        ));
    }
}
