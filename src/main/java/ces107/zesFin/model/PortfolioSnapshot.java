package ces107.zesFin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_snapshots",
        uniqueConstraints = @UniqueConstraint(name = "uk_snapshot_date_user_type",
                columnNames = {"date", "user_id", "entry_type"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @NotNull
    private LocalDate date;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type")
    private EntryType entryType;

    @NotNull
    private BigDecimal value;

    private BigDecimal monthlyContribution;

    private Double fixedIncomePercentage;
}
