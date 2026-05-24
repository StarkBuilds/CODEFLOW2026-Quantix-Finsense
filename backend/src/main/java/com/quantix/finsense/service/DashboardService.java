package com.quantix.finsense.service;

import com.quantix.finsense.dto.DashboardSummaryDTO;
import com.quantix.finsense.dto.TransactionDTO;
import com.quantix.finsense.entity.User;
import com.quantix.finsense.model.TransactionType;
import com.quantix.finsense.repository.TransactionRepository;
import com.quantix.finsense.security.CurrentUserService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public DashboardService(
            TransactionRepository transactionRepository, CurrentUserService currentUserService) {
        this.transactionRepository = transactionRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsForCurrentUser() {
        User user = currentUserService.requireCurrentUser();
        return transactionRepository.findByUser_IdOrderByDateDesc(user.getId()).stream()
                .map(TransactionDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummaryForCurrentUser() {
        User user = currentUserService.requireCurrentUser();
        BigDecimal income =
                transactionRepository.sumAmountByUserAndType(user.getId(), TransactionType.CREDIT);
        BigDecimal expense =
                transactionRepository.sumAmountByUserAndType(user.getId(), TransactionType.DEBIT);

        long totalIncome = toWholeRupees(income);
        long totalExpense = toWholeRupees(expense);
        int healthScore = calculateHealthScore(totalIncome, totalExpense);

        return new DashboardSummaryDTO(totalIncome, totalExpense, healthScore);
    }

    private long toWholeRupees(BigDecimal amount) {
        return amount.setScale(0, RoundingMode.HALF_UP).longValue();
    }

    private int calculateHealthScore(long totalIncome, long totalExpense) {
        if (totalIncome == 0 && totalExpense == 0) {
            return 50;
        }
        if (totalIncome > totalExpense) {
            long surplus = totalIncome - totalExpense;
            int bonus = (int) Math.min(30, (surplus * 30) / Math.max(totalIncome, 1));
            return Math.min(100, 70 + bonus);
        }
        if (totalIncome == totalExpense) {
            return 50;
        }
        long deficit = totalExpense - totalIncome;
        int penalty = (int) Math.min(50, (deficit * 50) / Math.max(totalExpense, 1));
        return Math.max(0, 49 - penalty);
    }
}
