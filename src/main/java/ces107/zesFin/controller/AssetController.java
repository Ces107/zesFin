package ces107.zesFin.controller;

import ces107.zesFin.model.Asset;
import ces107.zesFin.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    public List<Asset> getAll() {
        return assetService.findAll();
    }

    @GetMapping("/{id}")
    public Asset getById(@PathVariable Long id) {
        return assetService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Asset create(@Valid @RequestBody Asset asset) {
        return assetService.create(asset);
    }

    @PutMapping("/{id}")
    public Asset update(@PathVariable Long id, @Valid @RequestBody Asset asset) {
        return assetService.update(id, asset);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        assetService.delete(id);
    }

    @GetMapping("/total-value")
    public BigDecimal getTotalValue() {
        return assetService.totalPortfolioValue();
    }
}
