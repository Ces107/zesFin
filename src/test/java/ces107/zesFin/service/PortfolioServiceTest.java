package ces107.zesFin.service;

import ces107.zesFin.exception.DuplicateEntryException;
import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.EntryType;
import ces107.zesFin.model.PortfolioSnapshot;
import ces107.zesFin.model.User;
import ces107.zesFin.repository.PortfolioSnapshotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.doNothing;

/**
 * Unit tests for PortfolioService.
 *
 * Tests cover:
 * - CRUD operations
 * - Duplicate entry validation
 * - User scoping
 * - Edge cases
 */
@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private PortfolioSnapshotRepository repository;

    @InjectMocks
    private PortfolioService service;

    private User testUser;
    private PortfolioSnapshot testSnapshot;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L)
            .googleId("test-user")
            .email("test@example.com")
            .name("Test User")
            .build();

        testSnapshot = PortfolioSnapshot.builder()
            .id(1L)
            .user(testUser)
            .date(LocalDate.of(2026, 1, 1))
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(10000))
            .monthlyContribution(BigDecimal.valueOf(500))
            .fixedIncomePercentage(20.0)
            .build();
    }

    @Test
    void create_shouldSaveNewSnapshot_whenNoConflict() {
        // Arrange
        when(repository.findByUserAndDateAndEntryType(any(), any(), any()))
            .thenReturn(Optional.empty());
        when(repository.save(any(PortfolioSnapshot.class)))
            .thenReturn(testSnapshot);

        final PortfolioSnapshot newSnapshot = PortfolioSnapshot.builder()
            .date(LocalDate.of(2026, 1, 1))
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(10000))
            .build();

        // Act
        final PortfolioSnapshot result = service.create(newSnapshot, testUser);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUser()).isEqualTo(testUser);
        verify(repository).findByUserAndDateAndEntryType(testUser, newSnapshot.getDate(), newSnapshot.getEntryType());
        verify(repository).save(newSnapshot);
    }

    @Test
    void create_shouldThrowDuplicateEntryException_whenConflictExists() {
        // Arrange
        when(repository.findByUserAndDateAndEntryType(any(), any(), any()))
            .thenReturn(Optional.of(testSnapshot));

        final PortfolioSnapshot duplicateSnapshot = PortfolioSnapshot.builder()
            .date(testSnapshot.getDate())
            .entryType(testSnapshot.getEntryType())
            .value(BigDecimal.valueOf(15000))
            .build();

        // Act & Assert
        assertThatThrownBy(() -> service.create(duplicateSnapshot, testUser))
            .isInstanceOf(DuplicateEntryException.class)
            .hasMessageContaining(testSnapshot.getEntryType().toString())
            .hasMessageContaining(testSnapshot.getDate().toString());

        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldAllowDifferentEntryTypes_onSameDate() {
        // Arrange
        when(repository.findByUserAndDateAndEntryType(testUser, testSnapshot.getDate(), EntryType.PORTFOLIO_VALUE))
            .thenReturn(Optional.empty());

        final PortfolioSnapshot portfolioValueSnapshot = PortfolioSnapshot.builder()
            .date(testSnapshot.getDate())
            .entryType(EntryType.PORTFOLIO_VALUE)
            .value(BigDecimal.valueOf(12000))
            .build();

        when(repository.save(any(PortfolioSnapshot.class)))
            .thenReturn(portfolioValueSnapshot);

        // Act
        final PortfolioSnapshot result = service.create(portfolioValueSnapshot, testUser);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEntryType()).isEqualTo(EntryType.PORTFOLIO_VALUE);
        verify(repository).save(portfolioValueSnapshot);
    }

    @Test
    void findAll_shouldReturnUserSnapshots() {
        // Arrange
        final List<PortfolioSnapshot> snapshots = Arrays.asList(testSnapshot);
        when(repository.findAllByUserOrderByDateAsc(testUser))
            .thenReturn(snapshots);

        // Act
        final List<PortfolioSnapshot> result = service.findAll(testUser);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testSnapshot);
        verify(repository).findAllByUserOrderByDateAsc(testUser);
    }

    @Test
    void findLatest_shouldReturnMostRecentSnapshot() {
        // Arrange
        when(repository.findTopByUserOrderByDateDesc(testUser))
            .thenReturn(Optional.of(testSnapshot));

        // Act
        final Optional<PortfolioSnapshot> result = service.findLatest(testUser);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(testSnapshot);
        verify(repository).findTopByUserOrderByDateDesc(testUser);
    }

    @Test
    void findLatest_shouldReturnEmpty_whenNoSnapshots() {
        // Arrange
        when(repository.findTopByUserOrderByDateDesc(testUser))
            .thenReturn(Optional.empty());

        // Act
        final Optional<PortfolioSnapshot> result = service.findLatest(testUser);

        // Assert
        assertThat(result).isEmpty();
        verify(repository).findTopByUserOrderByDateDesc(testUser);
    }

    @Test
    void update_shouldUpdateSnapshot_whenNoConflict() {
        // Arrange
        final PortfolioSnapshot updatedSnapshot = PortfolioSnapshot.builder()
            .date(LocalDate.of(2026, 1, 2))
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(11000))
            .monthlyContribution(BigDecimal.valueOf(600))
            .fixedIncomePercentage(25.0)
            .build();

        when(repository.findByIdAndUser(1L, testUser))
            .thenReturn(Optional.of(testSnapshot));
        when(repository.findByUserAndDateAndEntryType(testUser, updatedSnapshot.getDate(), updatedSnapshot.getEntryType()))
            .thenReturn(Optional.empty());
        when(repository.save(any(PortfolioSnapshot.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        final PortfolioSnapshot result = service.update(1L, updatedSnapshot, testUser);

        // Assert
        assertThat(result.getValue()).isEqualTo(BigDecimal.valueOf(11000));
        assertThat(result.getMonthlyContribution()).isEqualTo(BigDecimal.valueOf(600));
        assertThat(result.getFixedIncomePercentage()).isEqualTo(25.0);
        verify(repository).save(testSnapshot);
    }

    @Test
    void update_shouldThrowResourceNotFoundException_whenSnapshotNotFound() {
        // Arrange
        when(repository.findByIdAndUser(999L, testUser))
            .thenReturn(Optional.empty());

        final PortfolioSnapshot updatedSnapshot = PortfolioSnapshot.builder()
            .date(LocalDate.of(2026, 1, 2))
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(11000))
            .build();

        // Act & Assert
        assertThatThrownBy(() -> service.update(999L, updatedSnapshot, testUser))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void update_shouldThrowDuplicateEntryException_whenConflictWithOtherSnapshot() {
        // Arrange
        final PortfolioSnapshot otherSnapshot = PortfolioSnapshot.builder()
            .id(2L)
            .user(testUser)
            .date(LocalDate.of(2026, 1, 2))
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(9000))
            .build();

        when(repository.findByIdAndUser(1L, testUser))
            .thenReturn(Optional.of(testSnapshot));
        when(repository.findByUserAndDateAndEntryType(testUser, LocalDate.of(2026, 1, 2), EntryType.TOTAL_INVESTED))
            .thenReturn(Optional.of(otherSnapshot));

        final PortfolioSnapshot updatedSnapshot = PortfolioSnapshot.builder()
            .date(LocalDate.of(2026, 1, 2))
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(11000))
            .build();

        // Act & Assert
        assertThatThrownBy(() -> service.update(1L, updatedSnapshot, testUser))
            .isInstanceOf(DuplicateEntryException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void update_shouldAllowUpdate_whenNoDateOrTypeChange() {
        // Arrange
        final PortfolioSnapshot updatedSnapshot = PortfolioSnapshot.builder()
            .date(testSnapshot.getDate())
            .entryType(testSnapshot.getEntryType())
            .value(BigDecimal.valueOf(11000))
            .build();

        when(repository.findByIdAndUser(1L, testUser))
            .thenReturn(Optional.of(testSnapshot));
        when(repository.save(any(PortfolioSnapshot.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        final PortfolioSnapshot result = service.update(1L, updatedSnapshot, testUser);

        // Assert
        assertThat(result.getValue()).isEqualTo(BigDecimal.valueOf(11000));
        verify(repository, never()).findByUserAndDateAndEntryType(any(), any(), any());
        verify(repository).save(testSnapshot);
    }

    @Test
    void delete_shouldDeleteSnapshot() {
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
    void delete_shouldThrowResourceNotFoundException_whenSnapshotNotFound() {
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
    void create_shouldSetUser_evenIfAlreadySet() {
        // Arrange
        final User wrongUser = User.builder()
            .id(999L)
            .googleId("wrong-user")
            .build();

        final PortfolioSnapshot snapshotWithWrongUser = PortfolioSnapshot.builder()
            .user(wrongUser)
            .date(LocalDate.of(2026, 1, 1))
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(10000))
            .build();

        when(repository.findByUserAndDateAndEntryType(any(), any(), any()))
            .thenReturn(Optional.empty());
        when(repository.save(any(PortfolioSnapshot.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        final PortfolioSnapshot result = service.create(snapshotWithWrongUser, testUser);

        // Assert
        assertThat(result.getUser()).isEqualTo(testUser);
        assertThat(result.getUser()).isNotEqualTo(wrongUser);
    }
}
