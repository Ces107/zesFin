package ces107.zesFin.integration;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base configuration for integration tests using Testcontainers.
 *
 * This class provides a PostgreSQL container for integration testing that
 * closely mimics the production environment. All integration tests should
 * extend this class to ensure consistency.
 */
@SpringBootTest
@ActiveProfiles("integration-test")
@Testcontainers
public abstract class IntegrationTestConfig {

    @Container
    protected static final PostgreSQLContainer<?> postgresContainer =
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("zesfin_test")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);

    /**
     * Dynamically configures Spring properties to use the Testcontainers PostgreSQL instance.
     */
    @DynamicPropertySource
    static void configureProperties(final DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");

        // Flyway configuration
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.clean-disabled", () -> "false");

        // JPA configuration for integration tests
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.show-sql", () -> "true");

        // Disable scheduler in integration tests
        registry.add("app.scheduler.recurring-transactions.enabled", () -> "false");
    }
}
