package ces107.zesFin.repository;

import ces107.zesFin.model.PortfolioSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, Long> {

    List<PortfolioSnapshot> findAllByOrderByDateAsc();

    Optional<PortfolioSnapshot> findTopByOrderByDateDesc();
}
