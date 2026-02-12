package ces107.zesFin.scheduler;

import ces107.zesFin.model.RecurrenceType;
import ces107.zesFin.model.Transaction;
import ces107.zesFin.model.TransactionType;
import ces107.zesFin.model.User;
import ces107.zesFin.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for RecurringTransactionScheduler.
 */
@ExtendWith(MockitoExtension.class)
class RecurringTransactionSchedulerTest {

    @Mock
    private TransactionRepository repository;

    @InjectMocks
    private RecurringTransactionScheduler scheduler;

    private User testUser;
    private Transaction recurringTransaction;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L)
            .googleId("test-user")
            .email("test@example.com")
            .name("Test User")
            .build();

        recurringTransaction = Transaction.builder()
            .id(1L)
            .user(testUser)
            .amount(BigDecimal.valueOf(750))
            .description("Monthly Rent")
            .type(TransactionType.EXPENSE)
            .category("Housing")
            .isRecurring(true)
            .recurrenceType(RecurrenceType.MONTHLY)
            .nextExecutionDate(LocalDate.now().minusDays(1))
            .build();
    }

    @Test
    void processRecurringTransactions_shouldCreateNewTransaction_whenDue() {
        // Arrange
        final LocalDate originalNextDate = LocalDate.of(2026, 2, 10);
        recurringTransaction.setNextExecutionDate(originalNextDate);

        when(repository.findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
            .thenReturn(List.of(recurringTransaction));

        final ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);

        // Act
        scheduler.processRecurringTransactions();

        // Assert
        verify(repository, times(2)).save(transactionCaptor.capture());

        final List<Transaction> savedTransactions = transactionCaptor.getAllValues();

        // First save: new non-recurring transaction
        final Transaction newTransaction = savedTransactions.get(0);
        assertThat(newTransaction.getIsRecurring()).isFalse();
        assertThat(newTransaction.getDescription()).startsWith("[AUTO]");
        assertThat(newTransaction.getDescription()).contains("Monthly Rent");
        assertThat(newTransaction.getAmount()).isEqualTo(BigDecimal.valueOf(750));
        assertThat(newTransaction.getType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(newTransaction.getCategory()).isEqualTo("Housing");

        // Second save: updated recurring transaction with new next execution date
        final Transaction updatedRecurring = savedTransactions.get(1);
        assertThat(updatedRecurring.getNextExecutionDate()).isAfter(originalNextDate);
    }

    @Test
    void processRecurringTransactions_shouldUpdateNextExecutionDate_monthly() {
        // Arrange
        final LocalDate originalDate = LocalDate.of(2026, 1, 15);
        recurringTransaction.setNextExecutionDate(originalDate);
        recurringTransaction.setRecurrenceType(RecurrenceType.MONTHLY);

        when(repository.findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
            .thenReturn(List.of(recurringTransaction));

        final ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);

        // Act
        scheduler.processRecurringTransactions();

        // Assert
        verify(repository, times(2)).save(transactionCaptor.capture());

        final Transaction updatedRecurring = transactionCaptor.getAllValues().get(1);
        assertThat(updatedRecurring.getNextExecutionDate()).isEqualTo(originalDate.plusMonths(1));
    }

    @Test
    void processRecurringTransactions_shouldUpdateNextExecutionDate_daily() {
        // Arrange
        final LocalDate originalDate = LocalDate.now().minusDays(1);
        recurringTransaction.setNextExecutionDate(originalDate);
        recurringTransaction.setRecurrenceType(RecurrenceType.DAILY);

        when(repository.findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
            .thenReturn(List.of(recurringTransaction));

        final ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);

        // Act
        scheduler.processRecurringTransactions();

        // Assert
        verify(repository, times(2)).save(transactionCaptor.capture());

        final Transaction updatedRecurring = transactionCaptor.getAllValues().get(1);
        assertThat(updatedRecurring.getNextExecutionDate()).isEqualTo(originalDate.plusDays(1));
    }

    @Test
    void processRecurringTransactions_shouldUpdateNextExecutionDate_weekly() {
        // Arrange
        final LocalDate originalDate = LocalDate.now().minusWeeks(1);
        recurringTransaction.setNextExecutionDate(originalDate);
        recurringTransaction.setRecurrenceType(RecurrenceType.WEEKLY);

        when(repository.findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
            .thenReturn(List.of(recurringTransaction));

        final ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);

        // Act
        scheduler.processRecurringTransactions();

        // Assert
        verify(repository, times(2)).save(transactionCaptor.capture());

        final Transaction updatedRecurring = transactionCaptor.getAllValues().get(1);
        assertThat(updatedRecurring.getNextExecutionDate()).isEqualTo(originalDate.plusWeeks(1));
    }

    @Test
    void processRecurringTransactions_shouldUpdateNextExecutionDate_yearly() {
        // Arrange
        final LocalDate originalDate = LocalDate.now().minusYears(1);
        recurringTransaction.setNextExecutionDate(originalDate);
        recurringTransaction.setRecurrenceType(RecurrenceType.YEARLY);

        when(repository.findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
            .thenReturn(List.of(recurringTransaction));

        final ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);

        // Act
        scheduler.processRecurringTransactions();

        // Assert
        verify(repository, times(2)).save(transactionCaptor.capture());

        final Transaction updatedRecurring = transactionCaptor.getAllValues().get(1);
        assertThat(updatedRecurring.getNextExecutionDate()).isEqualTo(originalDate.plusYears(1));
    }

    @Test
    void processRecurringTransactions_shouldProcessMultipleTransactions() {
        // Arrange
        final Transaction recurring2 = Transaction.builder()
            .id(2L)
            .user(testUser)
            .amount(BigDecimal.valueOf(50))
            .description("Netflix Subscription")
            .type(TransactionType.EXPENSE)
            .category("Subscriptions")
            .isRecurring(true)
            .recurrenceType(RecurrenceType.MONTHLY)
            .nextExecutionDate(LocalDate.now().minusDays(5))
            .build();

        when(repository.findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
            .thenReturn(Arrays.asList(recurringTransaction, recurring2));

        // Act
        scheduler.processRecurringTransactions();

        // Assert
        verify(repository, times(4)).save(any(Transaction.class)); // 2 new + 2 updated
    }

    @Test
    void processRecurringTransactions_shouldDoNothing_whenNoDueTransactions() {
        // Arrange
        when(repository.findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
            .thenReturn(Collections.emptyList());

        // Act
        scheduler.processRecurringTransactions();

        // Assert
        verify(repository, never()).save(any());
    }

    @Test
    void processRecurringTransactions_shouldSetCorrectDateOnNewTransaction() {
        // Arrange
        final LocalDate executionDate = LocalDate.of(2026, 1, 15);
        recurringTransaction.setNextExecutionDate(executionDate);

        when(repository.findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(any(LocalDate.class)))
            .thenReturn(List.of(recurringTransaction));

        final ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);

        // Act
        scheduler.processRecurringTransactions();

        // Assert
        verify(repository, times(2)).save(transactionCaptor.capture());

        final Transaction newTransaction = transactionCaptor.getAllValues().get(0);
        assertThat(newTransaction.getDate()).isEqualTo(executionDate);
    }
}
