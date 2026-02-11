package ces107.zesFin.service;

import ces107.zesFin.dto.FireProjection;
import ces107.zesFin.model.FireProfile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class FireCalculatorService {

    private static final MathContext MC = new MathContext(10, RoundingMode.HALF_UP);
    private static final int MAX_PROJECTION_YEARS = 60;

    public FireProjection calculate(FireProfile profile) {
        BigDecimal baseAnnualContribution = profile.getMonthlyContribution()
                .multiply(BigDecimal.valueOf(12));
        BigDecimal annualExpenses = profile.getMonthlyExpenses()
                .multiply(BigDecimal.valueOf(12));

        // FIRE number = annual expenses / safe withdrawal rate
        BigDecimal fireNumber = annualExpenses.divide(
                BigDecimal.valueOf(profile.getSafeWithdrawalRate()), MC);

        // Adjust FIRE number for inflation each year
        double realReturn = (1 + profile.getExpectedReturnRate()) /
                (1 + profile.getInflationRate()) - 1;

        Double increaseRate = profile.getAnnualContributionIncreaseRate();
        boolean variableContributions = increaseRate != null && increaseRate > 0;

        BigDecimal savings = profile.getCurrentSavings();
        BigDecimal totalContributions = profile.getCurrentSavings();
        int currentYear = LocalDate.now().getYear();
        int fireAge = -1;
        BigDecimal savingsAtFire = BigDecimal.ZERO;

        List<FireProjection.YearlyProjection> projections = new ArrayList<>();

        for (int year = 0; year <= MAX_PROJECTION_YEARS; year++) {
            int age = profile.getCurrentAge() + year;
            BigDecimal inflatedFireNumber = fireNumber.multiply(
                    BigDecimal.valueOf(Math.pow(1 + profile.getInflationRate(), year)), MC);

            // Calculate current year's contribution (variable or fixed)
            BigDecimal yearContribution = variableContributions
                    ? baseAnnualContribution.multiply(
                            BigDecimal.valueOf(Math.pow(1 + increaseRate, year)), MC)
                    : baseAnnualContribution;

            boolean milestone = fireAge == -1 && savings.compareTo(inflatedFireNumber) >= 0;
            if (milestone) {
                fireAge = age;
                savingsAtFire = savings;
            }

            projections.add(FireProjection.YearlyProjection.builder()
                    .age(age)
                    .year(currentYear + year)
                    .totalSavings(savings.setScale(2, RoundingMode.HALF_UP))
                    .totalContributions(totalContributions.setScale(2, RoundingMode.HALF_UP))
                    .totalGrowth(savings.subtract(totalContributions).setScale(2, RoundingMode.HALF_UP))
                    .fireNumber(inflatedFireNumber.setScale(2, RoundingMode.HALF_UP))
                    .annualContribution(yearContribution.setScale(2, RoundingMode.HALF_UP))
                    .fireMilestone(milestone)
                    .build());

            if (age >= 100) break;

            // Compound: savings = savings * (1 + realReturn) + yearContribution
            BigDecimal growth = savings.multiply(BigDecimal.valueOf(realReturn), MC);
            savings = savings.add(growth).add(yearContribution);
            totalContributions = totalContributions.add(yearContribution);
        }

        return FireProjection.builder()
                .currentAge(profile.getCurrentAge())
                .fireAge(fireAge == -1 ? null : fireAge)
                .yearsToFire(fireAge == -1 ? null : fireAge - profile.getCurrentAge())
                .fireNumber(fireNumber.setScale(2, RoundingMode.HALF_UP))
                .currentSavings(profile.getCurrentSavings())
                .projectedSavingsAtFire(savingsAtFire.setScale(2, RoundingMode.HALF_UP))
                .yearlyProjections(projections)
                .fireAchievable(fireAge != -1)
                .build();
    }
}
