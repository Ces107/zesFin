package ces107.zesFin.exception;

import ces107.zesFin.model.EntryType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Resource Not Found");
        pd.setType(URI.create("about:blank"));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, errors);
        pd.setTitle("Validation Failed");
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(AccessDeniedException.class)
    ProblemDetail handleAccessDenied(final AccessDeniedException ex) {
        final ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied");
        pd.setTitle("Forbidden");
        pd.setType(URI.create("about:blank"));
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(DuplicateEntryException.class)
    ProblemDetail handleDuplicateEntry(final DuplicateEntryException ex) {
        final String typeSpanish = switch(ex.getEntryType()) {
            case TOTAL_INVESTED -> "dinero total invertido";
            case PORTFOLIO_VALUE -> "valor del portfolio";
            case NET_WORTH -> "patrimonio neto";
            case LIQUID_ASSETS -> "activos líquidos";
        };

        final String message = String.format(
            "Ya has introducido un registro de %s para el día %s",
            typeSpanish,
            ex.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        );

        final ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, message);
        pd.setTitle("Duplicate Entry");
        pd.setType(URI.create("about:blank"));
        pd.setProperty("timestamp", Instant.now());
        pd.setProperty("entryType", ex.getEntryType());
        pd.setProperty("date", ex.getDate());
        return pd;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail handleDataIntegrity(final DataIntegrityViolationException ex) {
        String message = "Error de integridad en la base de datos";

        if (ex.getMessage() != null && ex.getMessage().contains("uk_snapshot_date_user_type")) {
            message = "Ya existe un registro con esa fecha y tipo de entry";
        }

        final ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, message);
        pd.setTitle("Constraint Violation");
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleGeneric(final Exception ex) {
        final ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        pd.setTitle("Internal Server Error");
        pd.setProperty("timestamp", Instant.now());
        return pd;
    }
}
