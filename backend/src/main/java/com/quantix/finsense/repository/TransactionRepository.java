package com.quantix.finsense.repository;

import com.quantix.finsense.entity.Transaction;
import com.quantix.finsense.model.TransactionType;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByOrderByDateDesc();

    List<Transaction> findByUser_IdOrderByDateDesc(Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.type = :type")
    BigDecimal sumAmountByType(@Param("type") TransactionType type);

    boolean existsByTransactionHash(String transactionHash);

    @Query("SELECT t.transactionHash FROM Transaction t WHERE t.transactionHash IN :hashes")
    Set<String> findExistingHashes(@Param("hashes") Collection<String> hashes);

    @Query(
            "SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumAmountByUserAndType(@Param("userId") Long userId, @Param("type") TransactionType type);
}
