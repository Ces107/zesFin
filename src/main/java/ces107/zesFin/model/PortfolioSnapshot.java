package ces107.zesFin.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_snapshots")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(unique = true)
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
