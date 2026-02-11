package ces107.zesFin.service;

import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.Transaction;
import ces107.zesFin.model.User;
import ces107.zesFin.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository repository;

    public List<Transaction> findAll(User user) {
        return repository.findAllByUserOrderByDateDesc(user);
    }

    public Transaction findById(Long id, User user) {
        return repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
    }

    public Transaction create(Transaction transaction, User user) {
        transaction.setUser(user);
        return repository.save(transaction);
    }

    public Transaction update(Long id, Transaction updated, User user) {
        Transaction existing = findById(id, user);
        existing.setAmount(updated.getAmount());
        existing.setDate(updated.getDate());
        existing.setDescription(updated.getDescription());
        existing.setType(updated.getType());
        existing.setCategory(updated.getCategory());
        return repository.save(existing);
    }

    public void delete(Long id, User user) {
        if (!repository.existsByIdAndUser(id, user)) {
            throw new ResourceNotFoundException("Transaction", id);
        }
        repository.deleteById(id);
    }

    public BigDecimal netCashFlow(User user, LocalDate start, LocalDate end) {
        if (start == null) start = LocalDate.now().withDayOfMonth(1);
        if (end == null) end = LocalDate.now();
        return repository.netCashFlow(user, start, end);
    }
}
