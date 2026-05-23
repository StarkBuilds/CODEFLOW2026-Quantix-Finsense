package com.quantix.finsense.controller;

import com.quantix.finsense.dto.DashboardSummaryDTO;
import com.quantix.finsense.dto.TransactionDTO;
import com.quantix.finsense.service.DashboardService;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/transactions")
    public List<TransactionDTO> getTransactions() {
        return dashboardService.getAllTransactions();
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryDTO getSummary() {
        return dashboardService.getSummary();
    }
}
