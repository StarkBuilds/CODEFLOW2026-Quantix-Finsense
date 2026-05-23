package com.quantix.finsense.repository;

import com.quantix.finsense.entity.Transaction;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUser_IdOrderByDateDesc(Long userId);

    boolean existsByTransactionHash(String transactionHash);

    @Query("SELECT t.transactionHash FROM Transaction t WHERE t.transactionHash IN :hashes")
    Set<String> findExistingHashes(@Param("hashes") Collection<String> hashes);
}
