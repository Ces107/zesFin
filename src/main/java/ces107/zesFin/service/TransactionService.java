package ces107.zesFin.service;

import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.Transaction;
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

    public List<Transaction> findAll() {
        return repository.findAllByOrderByDateDesc();
    }

    public Transaction findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
    }

    public Transaction create(Transaction transaction) {
        return repository.save(transaction);
    }

    public Transaction update(Long id, Transaction updated) {
        Transaction existing = findById(id);
        existing.setAmount(updated.getAmount());
        existing.setDate(updated.getDate());
        existing.setDescription(updated.getDescription());
        existing.setType(updated.getType());
        existing.setCategory(updated.getCategory());
        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction", id);
        }
        repository.deleteById(id);
    }

    public BigDecimal netCashFlow(LocalDate start, LocalDate end) {
        if (start == null) start = LocalDate.now().withDayOfMonth(1);
        if (end == null) end = LocalDate.now();
        return repository.netCashFlow(start, end);
    }
}
