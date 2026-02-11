package ces107.zesFin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_snapshots",
        uniqueConstraints = @UniqueConstraint(columnNames = {"date", "user_id"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @NotNull
    private LocalDate date;

    @NotNull
    private BigDecimal totalInvested;

    @NotNull
    private BigDecimal portfolioValue;

    @NotNull
    private BigDecimal monthlyContribution;

    private Double fixedIncomePercentage;

    private BigDecimal yield;
}
