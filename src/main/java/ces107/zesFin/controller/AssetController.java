package ces107.zesFin.controller;

import ces107.zesFin.model.Asset;
import ces107.zesFin.model.User;
import ces107.zesFin.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public List<Asset> getAll(@AuthenticationPrincipal User user) {
        return assetService.findAll(user);
    }

    @GetMapping("/{id}")
    public Asset getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return assetService.findById(id, user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Asset create(@Valid @RequestBody Asset asset, @AuthenticationPrincipal User user) {
        return assetService.create(asset, user);
    }

    @PutMapping("/{id}")
    public Asset update(@PathVariable Long id, @Valid @RequestBody Asset asset,
                        @AuthenticationPrincipal User user) {
        return assetService.update(id, asset, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        assetService.delete(id, user);
    }

    @GetMapping("/total-value")
    public BigDecimal getTotalValue(@AuthenticationPrincipal User user) {
        return assetService.totalPortfolioValue(user);
    }
}
