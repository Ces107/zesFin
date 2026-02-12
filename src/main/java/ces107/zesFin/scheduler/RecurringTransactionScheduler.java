package ces107.zesFin.scheduler;

import ces107.zesFin.model.RecurrenceType;
import ces107.zesFin.model.Transaction;
import ces107.zesFin.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.scheduler.recurring-transactions.enabled", havingValue = "true", matchIfMissing = true)
public class RecurringTransactionScheduler {

    private final TransactionRepository transactionRepository;

    /**
     * Processes recurring transactions that are due for execution.
     * Runs every 25 minutes by default (configurable via RECURRING_TX_CRON env var).
     */
    @Scheduled(cron = "${app.scheduler.recurring-transactions.cron:0 */25 * * * *}")
    public void processRecurringTransactions() {
        final LocalDate today = LocalDate.now();

        final List<Transaction> dueTransactions = transactionRepository
                .findAllByIsRecurringTrueAndNextExecutionDateLessThanEqual(today);

        log.info("Processing {} recurring transactions", dueTransactions.size());

        dueTransactions.forEach(this::executeRecurringTransaction);
    }

    private void executeRecurringTransaction(final Transaction recurring) {
        final Transaction newTx = Transaction.builder()
                .user(recurring.getUser())
                .amount(recurring.getAmount())
                .description("[AUTO] " + recurring.getDescription())
                .type(recurring.getType())
                .category(recurring.getCategory())
                .date(recurring.getNextExecutionDate())
                .isRecurring(false)
                .build();

        transactionRepository.save(newTx);
        log.info("Executed recurring transaction: {}", newTx.getDescription());

        recurring.setNextExecutionDate(calculateNextDate(
                recurring.getNextExecutionDate(),
                recurring.getRecurrenceType()
        ));
        transactionRepository.save(recurring);
    }

    private LocalDate calculateNextDate(final LocalDate current, final RecurrenceType type) {
        return switch(type) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
        };
    }
}
