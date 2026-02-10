package ces107.zesFin.controller;

import ces107.zesFin.model.Transaction;
import ces107.zesFin.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<Transaction> getAll() {
        return transactionService.findAll();
    }

    @GetMapping("/{id}")
    public Transaction getById(@PathVariable Long id) {
        return transactionService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction create(@Valid @RequestBody Transaction transaction) {
        return transactionService.create(transaction);
    }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id, @Valid @RequestBody Transaction transaction) {
        return transactionService.update(id, transaction);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        transactionService.delete(id);
    }

    @GetMapping("/net-cashflow")
    public BigDecimal getNetCashFlow(
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end) {
        return transactionService.netCashFlow(start, end);
    }
}
