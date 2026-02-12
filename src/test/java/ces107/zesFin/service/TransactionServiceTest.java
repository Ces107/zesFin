package ces107.zesFin.service;

import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.RecurrenceType;
import ces107.zesFin.model.Transaction;
import ces107.zesFin.model.TransactionType;
import ces107.zesFin.model.User;
import ces107.zesFin.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.doNothing;

/**
 * Unit tests for TransactionService.
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository repository;

    @InjectMocks
    private TransactionService service;

    private User testUser;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L)
            .googleId("test-user")
            .email("test@example.com")
            .name("Test User")
            .build();

        testTransaction = Transaction.builder()
            .id(1L)
            .user(testUser)
            .amount(BigDecimal.valueOf(2800))
            .date(LocalDate.now())
            .description("Monthly Salary")
            .type(TransactionType.INCOME)
            .category("Salary")
            .isRecurring(false)
            .build();
    }

    @Test
    void create_shouldSaveTransaction() {
        // Arrange
        when(repository.save(any(Transaction.class)))
            .thenReturn(testTransaction);

        final Transaction newTransaction = Transaction.builder()
            .amount(BigDecimal.valueOf(2800))
            .date(LocalDate.now())
            .description("Monthly Salary")
            .type(TransactionType.INCOME)
            .category("Salary")
            .build();

        // Act
        final Transaction result = service.create(newTransaction, testUser);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUser()).isEqualTo(testUser);
        verify(repository).save(newTransaction);
    }

    @Test
    void create_shouldSaveRecurringTransaction() {
        // Arrange
        final Transaction recurringTransaction = Transaction.builder()
            .amount(BigDecimal.valueOf(750))
            .date(LocalDate.now())
            .description("Rent Payment")
            .type(TransactionType.EXPENSE)
            .category("Housing")
            .isRecurring(true)
            .recurrenceType(RecurrenceType.MONTHLY)
            .nextExecutionDate(LocalDate.now().plusMonths(1))
            .build();

        when(repository.save(any(Transaction.class)))
            .thenReturn(recurringTransaction);

        // Act
        final Transaction result = service.create(recurringTransaction, testUser);

        // Assert
        assertThat(result.getIsRecurring()).isTrue();
        assertThat(result.getRecurrenceType()).isEqualTo(RecurrenceType.MONTHLY);
        assertThat(result.getNextExecutionDate()).isNotNull();
        verify(repository).save(recurringTransaction);
    }

    @Test
    void findAll_shouldReturnUserTransactions() {
        // Arrange
        final List<Transaction> transactions = Arrays.asList(testTransaction);
        when(repository.findAllByUserOrderByDateDesc(testUser))
            .thenReturn(transactions);

        // Act
        final List<Transaction> result = service.findAll(testUser);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testTransaction);
        verify(repository).findAllByUserOrderByDateDesc(testUser);
    }

    @Test
    void findById_shouldReturnTransaction() {
        // Arrange
        when(repository.findByIdAndUser(1L, testUser))
            .thenReturn(Optional.of(testTransaction));

        // Act
        final Transaction result = service.findById(1L, testUser);

        // Assert
        assertThat(result).isEqualTo(testTransaction);
        verify(repository).findByIdAndUser(1L, testUser);
    }

    @Test
    void findById_shouldThrowException_whenNotFound() {
        // Arrange
        when(repository.findByIdAndUser(999L, testUser))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> service.findById(999L, testUser))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("not found");
    }

    @Test
    void update_shouldUpdateTransaction() {
        // Arrange
        final Transaction updatedTransaction = Transaction.builder()
            .amount(BigDecimal.valueOf(3000))
            .date(LocalDate.now())
            .description("Updated Salary")
            .type(TransactionType.INCOME)
            .category("Salary")
            .build();

        when(repository.findByIdAndUser(1L, testUser))
            .thenReturn(Optional.of(testTransaction));
        when(repository.save(any(Transaction.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        final Transaction result = service.update(1L, updatedTransaction, testUser);

        // Assert
        assertThat(result.getAmount()).isEqualTo(BigDecimal.valueOf(3000));
        assertThat(result.getDescription()).isEqualTo("Updated Salary");
        verify(repository).save(testTransaction);
    }

    @Test
    void update_shouldThrowException_whenNotFound() {
        // Arrange
        when(repository.findByIdAndUser(999L, testUser))
            .thenReturn(Optional.empty());

        final Transaction updatedTransaction = Transaction.builder()
            .amount(BigDecimal.valueOf(3000))
            .build();

        // Act & Assert
        assertThatThrownBy(() -> service.update(999L, updatedTransaction, testUser))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void delete_shouldDeleteTransaction() {
        // Arrange
        when(repository.existsByIdAndUser(1L, testUser))
            .thenReturn(true);
        doNothing().when(repository).deleteById(1L);

        // Act
        service.delete(1L, testUser);

        // Assert
        verify(repository).existsByIdAndUser(1L, testUser);
        verify(repository).deleteById(1L);
    }

    @Test
    void delete_shouldThrowException_whenNotFound() {
        // Arrange
        when(repository.existsByIdAndUser(999L, testUser))
            .thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> service.delete(999L, testUser))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(repository).existsByIdAndUser(999L, testUser);
        verify(repository, never()).deleteById(any());
    }

    @Test
    void netCashFlow_shouldReturnCorrectCashFlow() {
        // Arrange
        final LocalDate startDate = LocalDate.of(2026, 1, 1);
        final LocalDate endDate = LocalDate.of(2026, 1, 31);

        final BigDecimal expectedCashFlow = BigDecimal.valueOf(3000);

        when(repository.netCashFlow(testUser, startDate, endDate))
            .thenReturn(expectedCashFlow);

        // Act
        final BigDecimal result = service.netCashFlow(testUser, startDate, endDate);

        // Assert
        assertThat(result).isEqualTo(BigDecimal.valueOf(3000));
        verify(repository).netCashFlow(testUser, startDate, endDate);
    }

    @Test
    void netCashFlow_shouldHandleZeroValues() {
        // Arrange
        final LocalDate startDate = LocalDate.of(2026, 1, 1);
        final LocalDate endDate = LocalDate.of(2026, 1, 31);

        when(repository.netCashFlow(testUser, startDate, endDate))
            .thenReturn(BigDecimal.ZERO);

        // Act
        final BigDecimal result = service.netCashFlow(testUser, startDate, endDate);

        // Assert
        assertThat(result).isEqualTo(BigDecimal.ZERO);
    }
}
