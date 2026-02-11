package ces107.zesFin.controller;

import ces107.zesFin.dto.FireProjection;
import ces107.zesFin.model.FireProfile;
import ces107.zesFin.model.User;
import ces107.zesFin.service.FireCalculatorService;
import ces107.zesFin.service.FireProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fire")
@RequiredArgsConstructor
public class FireController {

    private final FireProfileService profileService;
    private final FireCalculatorService calculatorService;

    @GetMapping("/profiles")
    public List<FireProfile> getAll(@AuthenticationPrincipal User user) {
        return profileService.findAll(user);
    }

    @GetMapping("/profiles/{id}")
    public FireProfile getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return profileService.findById(id, user);
    }

    @PostMapping("/profiles")
    @ResponseStatus(HttpStatus.CREATED)
    public FireProfile create(@Valid @RequestBody FireProfile profile,
                              @AuthenticationPrincipal User user) {
        return profileService.create(profile, user);
    }

    @PutMapping("/profiles/{id}")
    public FireProfile update(@PathVariable Long id, @Valid @RequestBody FireProfile profile,
                              @AuthenticationPrincipal User user) {
        return profileService.update(id, profile, user);
    }

    @GetMapping("/projection/{profileId}")
    public FireProjection getProjection(@PathVariable Long profileId,
                                        @AuthenticationPrincipal User user) {
        FireProfile profile = profileService.findById(profileId, user);
        return calculatorService.calculate(profile);
    }

    @PostMapping("/projection/simulate")
    public FireProjection simulate(@Valid @RequestBody FireProfile profile) {
        return calculatorService.calculate(profile);
    }
}
