package ces107.zesFin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entidad JPA que representa un movimiento financiero en la base de datos.
 */
@Entity
@Table(name = "movimientos_financieros")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoFinanciero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
