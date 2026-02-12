package ces107.zesFin.service;

import ces107.zesFin.exception.DuplicateEntryException;
import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.PortfolioSnapshot;
import ces107.zesFin.model.User;
import ces107.zesFin.repository.PortfolioSnapshotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioSnapshotRepository repository;

    public List<PortfolioSnapshot> findAll(User user) {
        return repository.findAllByUserOrderByDateAsc(user);
    }

    public Optional<PortfolioSnapshot> findLatest(User user) {
        return repository.findTopByUserOrderByDateDesc(user);
    }

    /**
     * Creates a new portfolio snapshot entry.
     * Validates that no duplicate entry exists for the same date, user, and entry type.
     *
     * @param snapshot The snapshot to create
     * @param user The authenticated user
     * @return The created snapshot
     * @throws DuplicateEntryException if an entry already exists for the same date and type
     */
    public PortfolioSnapshot create(final PortfolioSnapshot snapshot, final User user) {
        final Optional<PortfolioSnapshot> existing = repository
                .findByUserAndDateAndEntryType(user, snapshot.getDate(), snapshot.getEntryType());

        if (existing.isPresent()) {
            throw new DuplicateEntryException(snapshot.getEntryType(), snapshot.getDate());
        }

        snapshot.setUser(user);
        return repository.save(snapshot);
    }

    /**
     * Updates an existing portfolio snapshot entry.
     * Validates that the updated entry doesn't create a duplicate.
     *
     * @param id The snapshot ID to update
     * @param updated The updated snapshot data
     * @param user The authenticated user
     * @return The updated snapshot
     * @throws ResourceNotFoundException if snapshot not found
     * @throws DuplicateEntryException if update would create a duplicate
     */
    public PortfolioSnapshot update(final Long id, final PortfolioSnapshot updated, final User user) {
        final PortfolioSnapshot existing = repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("PortfolioSnapshot", id));

        if (!existing.getDate().equals(updated.getDate()) ||
            !existing.getEntryType().equals(updated.getEntryType())) {

            final Optional<PortfolioSnapshot> duplicate = repository
                    .findByUserAndDateAndEntryType(user, updated.getDate(), updated.getEntryType());

            if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
                throw new DuplicateEntryException(updated.getEntryType(), updated.getDate());
            }
        }

        existing.setDate(updated.getDate());
        existing.setEntryType(updated.getEntryType());
        existing.setValue(updated.getValue());
        existing.setMonthlyContribution(updated.getMonthlyContribution());
        existing.setFixedIncomePercentage(updated.getFixedIncomePercentage());

        return repository.save(existing);
    }

    public void delete(Long id, User user) {
        if (!repository.existsByIdAndUser(id, user)) {
            throw new ResourceNotFoundException("PortfolioSnapshot", id);
        }
        repository.deleteById(id);
    }
}
