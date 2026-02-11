package ces107.zesFin.repository;

import ces107.zesFin.model.MovimientoFinanciero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio para gestionar la entidad MovimientoFinanciero.
 * Hereda métodos estándar de JpaRepository: save, delete, findAll, findById, etc.
 */
@Repository
public interface MovimientoFinancieroRepository extends JpaRepository<MovimientoFinanciero, Long> {
}
