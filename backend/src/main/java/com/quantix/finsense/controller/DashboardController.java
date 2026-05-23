package com.quantix.finsense.controller;

import com.quantix.finsense.dto.DashboardSummaryDTO;
import com.quantix.finsense.dto.TransactionDTO;
import com.quantix.finsense.model.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    private static final List<TransactionDTO> MOCK_TRANSACTIONS = List.of(
            TransactionDTO.builder()
                    .id(1L)
                    .date(LocalDate.of(2026, 5, 2))
                    .narration("UPI-SWIGGY-BANGALORE")
                    .amount(new BigDecimal("450.00"))
                    .type(TransactionType.DEBIT)
                    .category("Food")
                    .build(),
            TransactionDTO.builder()
                    .id(2L)
                    .date(LocalDate.of(2026, 5, 5))
                    .narration("NACH-HDFC-HOME-LOAN-EMI")
                    .amount(new BigDecimal("18500.00"))
                    .type(TransactionType.DEBIT)
                    .category("EMI")
                    .build(),
            TransactionDTO.builder()
                    .id(3L)
                    .date(LocalDate.of(2026, 5, 1))
                    .narration("NEFT-SALARY-ACME-TECH-PVT-LTD")
                    .amount(new BigDecimal("85000.00"))
                    .type(TransactionType.CREDIT)
                    .category("Salary")
                    .build());

    private static final DashboardSummaryDTO MOCK_SUMMARY =
            new DashboardSummaryDTO(50000, 12000, 85);

    @GetMapping("/transactions")
    public List<TransactionDTO> getTransactions() {
        return MOCK_TRANSACTIONS;
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryDTO getSummary() {
        return MOCK_SUMMARY;
    }
}
