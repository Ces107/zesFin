package ces107.zesFin.repository;

import ces107.zesFin.model.EntryType;
import ces107.zesFin.model.PortfolioSnapshot;
import ces107.zesFin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, Long> {

    List<PortfolioSnapshot> findAllByUserOrderByDateAsc(User user);

    Optional<PortfolioSnapshot> findTopByUserOrderByDateDesc(User user);

    Optional<PortfolioSnapshot> findByIdAndUser(Long id, User user);

    boolean existsByIdAndUser(Long id, User user);

    Optional<PortfolioSnapshot> findByUserAndDateAndEntryType(User user, LocalDate date, EntryType entryType);

    List<PortfolioSnapshot> findAllByUserAndEntryTypeOrderByDateAsc(User user, EntryType entryType);

    Optional<PortfolioSnapshot> findTopByUserAndEntryTypeOrderByDateDesc(User user, EntryType entryType);
}
