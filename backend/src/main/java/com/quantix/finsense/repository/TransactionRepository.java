package com.quantix.finsense.repository;

import com.quantix.finsense.entity.Transaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser_IdOrderByDateDesc(Long userId);
}
