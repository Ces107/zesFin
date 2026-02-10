package ces107.zesFin.config;

import ces107.zesFin.model.*;
import ces107.zesFin.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TransactionRepository transactionRepository;
    private final PortfolioSnapshotRepository snapshotRepository;
    private final AssetRepository assetRepository;
    private final FireProfileRepository fireProfileRepository;

    @Override
    public void run(String... args) {
        if (transactionRepository.count() > 0) {
            log.info("Database already seeded, skipping initialization");
            return;
        }

        log.info("Seeding database with sample data...");
        seedTransactions();
        seedPortfolioSnapshots();
        seedAssets();
        seedFireProfile();
        log.info("Database seeding completed");
    }

    private void seedTransactions() {
        LocalDate now = LocalDate.now();

        // Income transactions
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("2800.00")).date(now.minusDays(1))
                .description("Monthly Salary").type(TransactionType.INCOME).category("Salary").build());
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("2800.00")).date(now.minusMonths(1).withDayOfMonth(28))
                .description("Monthly Salary").type(TransactionType.INCOME).category("Salary").build());
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("150.00")).date(now.minusDays(10))
                .description("Freelance Project").type(TransactionType.INCOME).category("Side Income").build());
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("45.20")).date(now.minusDays(5))
                .description("Dividend - Vanguard Global Stock").type(TransactionType.INCOME).category("Dividends").build());
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("2800.00")).date(now.minusMonths(2).withDayOfMonth(28))
                .description("Monthly Salary").type(TransactionType.INCOME).category("Salary").build());

        // Expense transactions
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("750.00")).date(now.minusDays(2))
                .description("Rent Payment").type(TransactionType.EXPENSE).category("Housing").build());
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("600.00")).date(now.minusDays(3))
                .description("Monthly Investment - MyInvestor").type(TransactionType.EXPENSE).category("Investment").build());
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("120.50")).date(now.minusDays(4))
                .description("Groceries - Mercadona").type(TransactionType.EXPENSE).category("Food").build());
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("49.99")).date(now.minusDays(7))
                .description("Electric Bill").type(TransactionType.EXPENSE).category("Utilities").build());
        transactionRepository.save(Transaction.builder()
                .amount(new BigDecimal("35.00")).date(now.minusDays(12))
                .description("Internet + Phone").type(TransactionType.EXPENSE).category("Utilities").build());
    }

    private void seedPortfolioSnapshots() {
        LocalDate startDate = LocalDate.now().minusMonths(23).withDayOfMonth(1);
        BigDecimal invested = new BigDecimal("5000.00");
        BigDecimal monthlyContrib = new BigDecimal("600.00");

        // Simulate realistic Boglehead portfolio growth (~7% annual with some volatility)
        double[] monthlyReturns = {
            0.012, -0.005, 0.018, 0.008, -0.015, 0.022,
            0.010, 0.015, -0.008, 0.020, 0.005, 0.012,
            -0.003, 0.016, 0.009, -0.010, 0.025, 0.007,
            0.011, -0.006, 0.019, 0.008, 0.014, 0.010
        };

        BigDecimal portfolioValue = invested;

        for (int i = 0; i < 24; i++) {
            LocalDate snapshotDate = startDate.plusMonths(i);

            // Apply market return
            double returnRate = monthlyReturns[i];
            portfolioValue = portfolioValue.multiply(BigDecimal.ONE.add(BigDecimal.valueOf(returnRate)))
                    .setScale(2, RoundingMode.HALF_UP);

            // Add contribution (except first month)
            if (i > 0) {
                invested = invested.add(monthlyContrib);
                portfolioValue = portfolioValue.add(monthlyContrib);
            }

            BigDecimal yieldValue = portfolioValue.subtract(invested);
            double fixedIncomePct = 20.0; // 80/20 Boglehead split

            snapshotRepository.save(PortfolioSnapshot.builder()
                    .date(snapshotDate)
                    .totalInvested(invested)
                    .portfolioValue(portfolioValue)
                    .monthlyContribution(monthlyContrib)
                    .fixedIncomePercentage(fixedIncomePct)
                    .yield(yieldValue)
                    .build());
        }
    }

    private void seedAssets() {
        // Typical Boglehead 3-fund portfolio on MyInvestor (UCITS funds)
        assetRepository.save(Asset.builder()
                .name("Vanguard Global Stock Index Fund")
                .isin("IE00B03HCZ61")
                .category(AssetCategory.EQUITY)
                .currentValue(new BigDecimal("12450.00"))
                .currency("EUR")
                .allocationPercentage(60.0)
                .totalInvested(new BigDecimal("11200.00"))
                .unrealizedGain(new BigDecimal("1250.00"))
                .build());

        assetRepository.save(Asset.builder()
                .name("Vanguard Emerging Markets Stock Index")
                .isin("IE0031786142")
                .category(AssetCategory.EQUITY)
                .currentValue(new BigDecimal("2100.00"))
                .currency("EUR")
                .allocationPercentage(10.0)
                .totalInvested(new BigDecimal("2200.00"))
                .unrealizedGain(new BigDecimal("-100.00"))
                .build());

        assetRepository.save(Asset.builder()
                .name("Vanguard Euro Government Bond Index")
                .isin("IE0007472990")
                .category(AssetCategory.BONDS)
                .currentValue(new BigDecimal("3800.00"))
                .currency("EUR")
                .allocationPercentage(20.0)
                .totalInvested(new BigDecimal("3750.00"))
                .unrealizedGain(new BigDecimal("50.00"))
                .build());

        assetRepository.save(Asset.builder()
                .name("Vanguard European Stock Index Fund")
                .isin("IE0007987708")
                .category(AssetCategory.EQUITY)
                .currentValue(new BigDecimal("1550.00"))
                .currency("EUR")
                .allocationPercentage(7.5)
                .totalInvested(new BigDecimal("1400.00"))
                .unrealizedGain(new BigDecimal("150.00"))
                .build());

        assetRepository.save(Asset.builder()
                .name("Emergency Fund - MyInvestor Savings")
                .isin(null)
                .category(AssetCategory.CASH)
                .currentValue(new BigDecimal("5000.00"))
                .currency("EUR")
                .allocationPercentage(2.5)
                .totalInvested(new BigDecimal("5000.00"))
                .unrealizedGain(BigDecimal.ZERO)
                .build());
    }

    private void seedFireProfile() {
        fireProfileRepository.save(FireProfile.builder()
                .currentAge(30)
                .currentSavings(new BigDecimal("24900.00"))
                .monthlyContribution(new BigDecimal("600.00"))
                .monthlyExpenses(new BigDecimal("1500.00"))
                .expectedReturnRate(0.07)
                .inflationRate(0.025)
                .safeWithdrawalRate(0.04)
                .targetRetirementAge(45)
                .fireNumber(new BigDecimal("450000.00"))
                .build());
    }
}
