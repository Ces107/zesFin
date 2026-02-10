package ces107.zesFin.controller;

import ces107.zesFin.dto.FireProjection;
import ces107.zesFin.model.FireProfile;
import ces107.zesFin.service.FireCalculatorService;
import ces107.zesFin.service.FireProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fire")
@RequiredArgsConstructor
public class FireController {

    private final FireProfileService profileService;
    private final FireCalculatorService calculatorService;

    @GetMapping("/profiles")
    public List<FireProfile> getAll() {
        return profileService.findAll();
    }

    @GetMapping("/profiles/{id}")
    public FireProfile getById(@PathVariable Long id) {
        return profileService.findById(id);
    }

    @PostMapping("/profiles")
    @ResponseStatus(HttpStatus.CREATED)
    public FireProfile create(@Valid @RequestBody FireProfile profile) {
        return profileService.create(profile);
    }

    @PutMapping("/profiles/{id}")
    public FireProfile update(@PathVariable Long id, @Valid @RequestBody FireProfile profile) {
        return profileService.update(id, profile);
    }

    @GetMapping("/projection/{profileId}")
    public FireProjection getProjection(@PathVariable Long profileId) {
        FireProfile profile = profileService.findById(profileId);
        return calculatorService.calculate(profile);
    }

    @PostMapping("/projection/simulate")
    public FireProjection simulate(@Valid @RequestBody FireProfile profile) {
        return calculatorService.calculate(profile);
    }
}
