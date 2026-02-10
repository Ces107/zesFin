package ces107.zesFin.model;

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
