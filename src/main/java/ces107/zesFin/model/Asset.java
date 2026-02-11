package ces107.zesFin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "assets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @NotBlank
    private String name;

    private String isin;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AssetCategory category;

    @NotNull
    private BigDecimal currentValue;

    @NotBlank
    private String currency;

    private Double allocationPercentage;

    private BigDecimal totalInvested;

    private BigDecimal unrealizedGain;
}
