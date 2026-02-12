package ces107.zesFin.exception;

import ces107.zesFin.model.EntryType;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class DuplicateEntryException extends RuntimeException {
    private final EntryType entryType;
    private final LocalDate date;

    public DuplicateEntryException(final EntryType entryType, final LocalDate date) {
        super(String.format("An entry of type %s already exists for date %s", entryType, date));
        this.entryType = entryType;
        this.date = date;
    }
}
