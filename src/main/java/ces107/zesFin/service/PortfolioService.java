package ces107.zesFin.service;

import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.PortfolioSnapshot;
import ces107.zesFin.repository.PortfolioSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioSnapshotRepository repository;

    public List<PortfolioSnapshot> findAll() {
        return repository.findAllByOrderByDateAsc();
    }

    public Optional<PortfolioSnapshot> findLatest() {
        return repository.findTopByOrderByDateDesc();
    }

    public PortfolioSnapshot create(PortfolioSnapshot snapshot) {
        return repository.save(snapshot);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("PortfolioSnapshot", id);
        }
        repository.deleteById(id);
    }
}
