package ces107.zesFin.service;

import ces107.zesFin.dto.DashboardSummary;
import ces107.zesFin.model.EntryType;
import ces107.zesFin.model.PortfolioSnapshot;
import ces107.zesFin.model.User;
import ces107.zesFin.repository.AssetRepository;
import ces107.zesFin.repository.PortfolioSnapshotRepository;
import ces107.zesFin.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PortfolioSnapshotRepository snapshotRepository;
    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;

    /**
     * Builds a dashboard summary for the given user.
     * Retrieves latest entries of each type independently.
     *
     * @param user the authenticated user
     * @return aggregated dashboard data
     */
    public DashboardSummary getSummary(final User user) {
        final Optional<PortfolioSnapshot> latestInvested = snapshotRepository
                .findTopByUserAndEntryTypeOrderByDateDesc(user, EntryType.TOTAL_INVESTED);

        final Optional<PortfolioSnapshot> latestValue = snapshotRepository
                .findTopByUserAndEntryTypeOrderByDateDesc(user, EntryType.PORTFOLIO_VALUE);

        final BigDecimal totalInvested = latestInvested
                .map(PortfolioSnapshot::getValue)
                .orElse(BigDecimal.ZERO);

        final BigDecimal portfolioValue = latestValue
                .map(PortfolioSnapshot::getValue)
                .orElse(BigDecimal.ZERO);

        final BigDecimal yield = portfolioValue.subtract(totalInvested);

        final LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        final BigDecimal netCashFlow = transactionRepository.netCashFlow(user, monthStart, LocalDate.now());
        final BigDecimal totalAssetValue = assetRepository.totalPortfolioValue(user);

        return new DashboardSummary(portfolioValue, totalInvested, yield, netCashFlow, totalAssetValue);
    }
}
