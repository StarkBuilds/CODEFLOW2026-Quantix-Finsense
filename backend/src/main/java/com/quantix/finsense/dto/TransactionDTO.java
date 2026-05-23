package com.quantix.finsense.dto;

import com.quantix.finsense.entity.Transaction;
import com.quantix.finsense.model.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {

    private Long id;
    private LocalDate date;
    private String narration;
    private BigDecimal amount;
    private TransactionType type;
    private String category;

    public static TransactionDTO fromEntity(Transaction transaction) {
        return TransactionDTO.builder()
                .id(transaction.getId())
                .date(transaction.getDate())
                .narration(transaction.getNarration())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .category(transaction.getCategory())
                .build();
    }
}
