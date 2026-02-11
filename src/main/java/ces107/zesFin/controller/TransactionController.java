package ces107.zesFin.controller;

import ces107.zesFin.model.Transaction;
import ces107.zesFin.model.User;
import ces107.zesFin.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public List<Transaction> getAll(@AuthenticationPrincipal User user) {
        return transactionService.findAll(user);
    }

    @GetMapping("/{id}")
    public Transaction getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return transactionService.findById(id, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Transaction create(@Valid @RequestBody Transaction transaction,
                              @AuthenticationPrincipal User user) {
        return transactionService.create(transaction, user);
    }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id, @Valid @RequestBody Transaction transaction,
                              @AuthenticationPrincipal User user) {
        return transactionService.update(id, transaction, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        transactionService.delete(id, user);
    }

    @GetMapping("/net-cashflow")
    public BigDecimal getNetCashFlow(
            @RequestParam(required = false) LocalDate start,
            @RequestParam(required = false) LocalDate end,
            @AuthenticationPrincipal User user) {
        return transactionService.netCashFlow(user, start, end);
    }
}
