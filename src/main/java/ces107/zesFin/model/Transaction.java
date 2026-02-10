package ces107.zesFin.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDate date;

    @NotBlank
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @NotBlank
    private String category;
}
