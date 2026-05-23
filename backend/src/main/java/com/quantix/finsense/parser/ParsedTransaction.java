package com.quantix.finsense.parser;

import com.quantix.finsense.model.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ParsedTransaction(
        LocalDate date, String narration, BigDecimal amount, TransactionType type) {}
