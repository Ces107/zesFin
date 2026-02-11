package ces107.zesFin.controller;

import ces107.zesFin.exception.ResourceNotFoundException;
import ces107.zesFin.model.PortfolioSnapshot;
import ces107.zesFin.model.User;
import ces107.zesFin.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio/snapshots")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    public List<PortfolioSnapshot> getAll(@AuthenticationPrincipal User user) {
        return portfolioService.findAll(user);
    }

    @GetMapping("/latest")
    public PortfolioSnapshot getLatest(@AuthenticationPrincipal User user) {
        return portfolioService.findLatest(user)
                .orElseThrow(() -> new ResourceNotFoundException("PortfolioSnapshot", 0L));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PortfolioSnapshot create(@Valid @RequestBody PortfolioSnapshot snapshot,
                                    @AuthenticationPrincipal User user) {
        return portfolioService.create(snapshot, user);
    }

    @PutMapping("/{id}")
    public PortfolioSnapshot update(@PathVariable Long id, @Valid @RequestBody PortfolioSnapshot snapshot,
                                    @AuthenticationPrincipal User user) {
        return portfolioService.update(id, snapshot, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        portfolioService.delete(id, user);
    }
}
