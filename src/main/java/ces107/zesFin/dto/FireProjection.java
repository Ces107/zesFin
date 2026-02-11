package ces107.zesFin.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FireProjection {
    private Integer currentAge;
    private Integer fireAge;
    private Integer yearsToFire;
    private BigDecimal fireNumber;
    private BigDecimal currentSavings;
    private BigDecimal projectedSavingsAtFire;
    private List<YearlyProjection> yearlyProjections;
    private boolean fireAchievable;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class YearlyProjection {
        private Integer age;
        private Integer year;
        private BigDecimal totalSavings;
        private BigDecimal totalContributions;
        private BigDecimal totalGrowth;
        private BigDecimal fireNumber;
        private BigDecimal annualContribution;
        private boolean fireMilestone;
    }
}
