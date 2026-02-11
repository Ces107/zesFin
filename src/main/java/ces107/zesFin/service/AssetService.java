package ces107.zesFin.service;

import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.Asset;
import ces107.zesFin.model.User;
import ces107.zesFin.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository repository;

    public List<Asset> findAll(User user) {
        return repository.findAllByUser(user);
    }

    public Asset findById(Long id, User user) {
        return repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", id));
    }

    public Asset create(Asset asset, User user) {
        asset.setUser(user);
        return repository.save(asset);
    }

    public Asset update(Long id, Asset updated, User user) {
        Asset existing = findById(id, user);
        existing.setName(updated.getName());
        existing.setIsin(updated.getIsin());
        existing.setCategory(updated.getCategory());
        existing.setCurrentValue(updated.getCurrentValue());
        existing.setCurrency(updated.getCurrency());
        existing.setAllocationPercentage(updated.getAllocationPercentage());
        existing.setTotalInvested(updated.getTotalInvested());
        existing.setUnrealizedGain(updated.getUnrealizedGain());
        return repository.save(existing);
    }

    public void delete(Long id, User user) {
        if (!repository.existsByIdAndUser(id, user)) {
            throw new ResourceNotFoundException("Asset", id);
        }
        repository.deleteById(id);
    }

    public BigDecimal totalPortfolioValue(User user) {
        return repository.totalPortfolioValue(user);
    }
}
