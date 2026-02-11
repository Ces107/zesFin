package ces107.zesFin.service;

import ces107.zesFin.dto.DashboardSummary;
import ces107.zesFin.model.PortfolioSnapshot;
import ces107.zesFin.model.User;
import ces107.zesFin.repository.AssetRepository;
import ces107.zesFin.repository.PortfolioSnapshotRepository;
import ces107.zesFin.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PortfolioSnapshotRepository snapshotRepository;
    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;

    /**
     * Builds a dashboard summary for the given user.
     *
     * @param user the authenticated user
     * @return aggregated dashboard data
     */
    public DashboardSummary getSummary(User user) {
        PortfolioSnapshot latest = snapshotRepository.findTopByUserOrderByDateDesc(user).orElse(null);

        BigDecimal totalPatrimonio = latest != null ? latest.getPortfolioValue() : BigDecimal.ZERO;
        BigDecimal totalInvested = latest != null ? latest.getTotalInvested() : BigDecimal.ZERO;
        BigDecimal yield = latest != null ? latest.getYield() : BigDecimal.ZERO;

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        BigDecimal netCashFlow = transactionRepository.netCashFlow(user, monthStart, LocalDate.now());
        BigDecimal totalAssetValue = assetRepository.totalPortfolioValue(user);

        return new DashboardSummary(totalPatrimonio, totalInvested, yield, netCashFlow, totalAssetValue);
    }
}
