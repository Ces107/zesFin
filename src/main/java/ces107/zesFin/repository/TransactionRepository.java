package ces107.zesFin.repository;

import ces107.zesFin.model.Transaction;
import ces107.zesFin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findAllByUserOrderByDateDesc(User user);

    Optional<Transaction> findByIdAndUser(Long id, User user);

    boolean existsByIdAndUser(Long id, User user);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) - " +
           "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0) " +
           "FROM Transaction t WHERE t.user = :user AND t.date BETWEEN :start AND :end")
    BigDecimal netCashFlow(@Param("user") User user, @Param("start") LocalDate start, @Param("end") LocalDate end);

    List<Transaction> findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(LocalDate date);
}
