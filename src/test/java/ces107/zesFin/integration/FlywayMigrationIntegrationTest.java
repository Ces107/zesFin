package ces107.zesFin.integration;

import ces107.zesFin.model.*;
import ces107.zesFin.repository.PortfolioSnapshotRepository;
import ces107.zesFin.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for Flyway database migrations.
 *
 * These tests verify that:
 * 1. Migrations execute successfully
 * 2. Schema is created correctly
 * 3. Constraints work as expected
 * 4. CRUD operations function properly
 */
@SpringBootTest
class FlywayMigrationIntegrationTest extends IntegrationTestConfig {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PortfolioSnapshotRepository snapshotRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Verifies that the portfolio_snapshots table exists with the correct schema.
     */
    @Test
    void shouldHavePortfolioSnapshotsTableWithCorrectSchema() {
        // Query information_schema to verify columns exist
        final List<Map<String, Object>> columns = jdbcTemplate.queryForList(
            "SELECT column_name, data_type, is_nullable " +
            "FROM information_schema.columns " +
            "WHERE table_name = 'portfolio_snapshots' " +
            "ORDER BY column_name"
        );

        assertThat(columns).isNotEmpty();

        // Verify critical columns exist
        final List<String> columnNames = columns.stream()
            .map(col -> (String) col.get("column_name"))
            .toList();

        assertThat(columnNames).contains(
            "id",
            "user_id",
            "date",
            "entry_type",
            "value",
            "monthly_contribution",
            "fixed_income_percentage"
        );
    }

    /**
     * Verifies that entry_type and value columns are NOT NULL.
     */
    @Test
    void shouldHaveNotNullConstraintsOnCriticalColumns() {
        final Map<String, Object> entryTypeColumn = jdbcTemplate.queryForMap(
            "SELECT is_nullable FROM information_schema.columns " +
            "WHERE table_name = 'portfolio_snapshots' AND column_name = 'entry_type'"
        );

        final Map<String, Object> valueColumn = jdbcTemplate.queryForMap(
            "SELECT is_nullable FROM information_schema.columns " +
            "WHERE table_name = 'portfolio_snapshots' AND column_name = 'value'"
        );

        assertThat(entryTypeColumn.get("is_nullable")).isEqualTo("NO");
        assertThat(valueColumn.get("is_nullable")).isEqualTo("NO");
    }

    /**
     * Verifies that the unique constraint on (date, user_id, entry_type) exists.
     */
    @Test
    void shouldHaveUniqueConstraintOnDateUserIdEntryType() {
        final List<Map<String, Object>> constraints = jdbcTemplate.queryForList(
            "SELECT constraint_name " +
            "FROM information_schema.table_constraints " +
            "WHERE table_name = 'portfolio_snapshots' " +
            "AND constraint_type = 'UNIQUE'"
        );

        final List<String> constraintNames = constraints.stream()
            .map(c -> (String) c.get("constraint_name"))
            .toList();

        assertThat(constraintNames).contains("uk_snapshot_date_user_type");
    }

    /**
     * Verifies that creating two entries with different types on the same date succeeds.
     */
    @Test
    void shouldAllowDifferentEntryTypesOnSameDate() {
        final User testUser = userRepository.save(User.builder()
            .googleId("test-migration-1")
            .email("test1@example.com")
            .name("Test User 1")
            .pictureUrl("")
            .build());

        final LocalDate today = LocalDate.now();

        final PortfolioSnapshot invested = snapshotRepository.save(PortfolioSnapshot.builder()
            .user(testUser)
            .date(today)
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(10000))
            .monthlyContribution(BigDecimal.valueOf(500))
            .fixedIncomePercentage(20.0)
            .build());

        final PortfolioSnapshot portfolioValue = snapshotRepository.save(PortfolioSnapshot.builder()
            .user(testUser)
            .date(today)
            .entryType(EntryType.PORTFOLIO_VALUE)
            .value(BigDecimal.valueOf(12000))
            .monthlyContribution(BigDecimal.valueOf(500))
            .fixedIncomePercentage(20.0)
            .build());

        assertThat(invested.getId()).isNotNull();
        assertThat(portfolioValue.getId()).isNotNull();
        assertThat(invested.getId()).isNotEqualTo(portfolioValue.getId());
    }

    /**
     * Verifies that creating two entries with the same type on the same date fails.
     */
    @Test
    void shouldPreventDuplicateEntryTypeOnSameDate() {
        final User testUser = userRepository.save(User.builder()
            .googleId("test-migration-2")
            .email("test2@example.com")
            .name("Test User 2")
            .pictureUrl("")
            .build());

        final LocalDate today = LocalDate.now().plusDays(1);

        snapshotRepository.save(PortfolioSnapshot.builder()
            .user(testUser)
            .date(today)
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(10000))
            .build());

        // Attempt to create duplicate - should throw exception
        assertThatThrownBy(() -> {
            snapshotRepository.save(PortfolioSnapshot.builder()
                .user(testUser)
                .date(today)
                .entryType(EntryType.TOTAL_INVESTED)
                .value(BigDecimal.valueOf(15000))
                .build());
            snapshotRepository.flush(); // Force immediate execution
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    /**
     * Verifies that users can have separate entries without conflict.
     */
    @Test
    void shouldAllowSameEntryTypeForDifferentUsers() {
        final User user1 = userRepository.save(User.builder()
            .googleId("test-migration-3")
            .email("test3@example.com")
            .name("Test User 3")
            .pictureUrl("")
            .build());

        final User user2 = userRepository.save(User.builder()
            .googleId("test-migration-4")
            .email("test4@example.com")
            .name("Test User 4")
            .pictureUrl("")
            .build());

        final LocalDate today = LocalDate.now().plusDays(2);

        final PortfolioSnapshot user1Snapshot = snapshotRepository.save(PortfolioSnapshot.builder()
            .user(user1)
            .date(today)
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(10000))
            .build());

        final PortfolioSnapshot user2Snapshot = snapshotRepository.save(PortfolioSnapshot.builder()
            .user(user2)
            .date(today)
            .entryType(EntryType.TOTAL_INVESTED)
            .value(BigDecimal.valueOf(20000))
            .build());

        assertThat(user1Snapshot.getId()).isNotNull();
        assertThat(user2Snapshot.getId()).isNotNull();
        assertThat(user1Snapshot.getValue()).isEqualTo(BigDecimal.valueOf(10000));
        assertThat(user2Snapshot.getValue()).isEqualTo(BigDecimal.valueOf(20000));
    }

    /**
     * Verifies that all EntryType enum values can be stored and retrieved.
     */
    @Test
    void shouldSupportAllEntryTypeValues() {
        final User testUser = userRepository.save(User.builder()
            .googleId("test-migration-5")
            .email("test5@example.com")
            .name("Test User 5")
            .pictureUrl("")
            .build());

        final LocalDate baseDate = LocalDate.now().plusDays(10);

        // Create an entry for each EntryType
        for (int i = 0; i < EntryType.values().length; i++) {
            final EntryType type = EntryType.values()[i];
            final LocalDate date = baseDate.plusDays(i);

            final PortfolioSnapshot snapshot = snapshotRepository.save(PortfolioSnapshot.builder()
                .user(testUser)
                .date(date)
                .entryType(type)
                .value(BigDecimal.valueOf(1000 * (i + 1)))
                .build());

            assertThat(snapshot.getId()).isNotNull();
            assertThat(snapshot.getEntryType()).isEqualTo(type);
        }

        // Verify we can retrieve by entry type
        final List<PortfolioSnapshot> investedEntries = snapshotRepository
            .findAllByUserAndEntryTypeOrderByDateAsc(testUser, EntryType.TOTAL_INVESTED);

        assertThat(investedEntries).hasSize(1);
        assertThat(investedEntries.get(0).getEntryType()).isEqualTo(EntryType.TOTAL_INVESTED);
    }
}
