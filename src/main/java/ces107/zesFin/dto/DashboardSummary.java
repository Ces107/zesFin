package ces107.zesFin.dto;

import java.math.BigDecimal;

public record DashboardSummary(
        BigDecimal totalPatrimonio,
        BigDecimal totalInvested,
        BigDecimal yield,
        BigDecimal netCashFlow,
        BigDecimal totalAssetValue
) {}
