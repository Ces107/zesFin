package ces107.zesFin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "fire_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FireProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @NotNull
    private Integer currentAge;

    @NotNull
    private BigDecimal currentSavings;

    @NotNull
    private BigDecimal monthlyContribution;

    @NotNull
    private BigDecimal monthlyExpenses;

    @NotNull
    private Double expectedReturnRate; // annual, e.g. 0.07 for 7%

    @NotNull
    private Double inflationRate; // e.g. 0.02 for 2%

    @NotNull
    private Double safeWithdrawalRate; // typically 0.04 (4% rule)

    private Integer targetRetirementAge;

    private BigDecimal fireNumber; // calculated: monthlyExpenses * 12 / SWR

    private Double annualContributionIncreaseRate; // e.g., 0.10 for 10% annual increase
}
