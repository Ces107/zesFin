package ces107.zesFin.repository;

import ces107.zesFin.model.Asset;
import ces107.zesFin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findAllByUser(User user);

    Optional<Asset> findByIdAndUser(Long id, User user);

    boolean existsByIdAndUser(Long id, User user);

    @Query("SELECT COALESCE(SUM(a.currentValue), 0) FROM Asset a WHERE a.user = :user")
    BigDecimal totalPortfolioValue(@Param("user") User user);
}
