package ces107.zesFin.repository;

import ces107.zesFin.model.Asset;
import ces107.zesFin.model.AssetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByCategory(AssetCategory category);

    @Query("SELECT COALESCE(SUM(a.currentValue), 0) FROM Asset a")
    BigDecimal totalPortfolioValue();
}
