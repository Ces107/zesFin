package ces107.zesFin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movimientos_financieros")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoFinanciero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "cantidad", precision = 19, scale = 2)
    private BigDecimal cantidad;

    @Column(name = "fecha_transaccion")
    private LocalDate fechaTransaccion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento")
    private TipoMovimiento tipoMovimiento;
}
