package ces107.zesFin.repository;

import ces107.zesFin.model.Transaction;
import ces107.zesFin.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByOrderByDateDesc();

    List<Transaction> findByType(TransactionType type);

    List<Transaction> findByDateBetweenOrderByDateDesc(LocalDate start, LocalDate end);

    List<Transaction> findByCategory(String category);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) - " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) " +
           "FROM Transaction t WHERE t.date BETWEEN :start AND :end")
    BigDecimal netCashFlow(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
