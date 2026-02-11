package ces107.zesFin.controller;

import ces107.zesFin.model.User;
import ces107.zesFin.security.JwtService;
import ces107.zesFin.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // TODO: Remove test login dependencies when OAuth2 is fully working in production
    private final JwtService jwtService;
    private final UserService userService;

    /**
     * Returns the authenticated user's profile information.
     *
     * @param user the currently authenticated user
     * @return user profile as a map
     */
    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal User user) {
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName() != null ? user.getName() : "",
                "pictureUrl", user.getPictureUrl() != null ? user.getPictureUrl() : ""
        );
    }

    /**
     * Returns the OAuth2 login URL for Google.
     *
     * @return login URL map
     */
    @GetMapping("/login-url")
    public Map<String, String> loginUrl() {
        return Map.of("url", "/oauth2/authorization/google");
    }

    // TODO: Remove test login endpoint when OAuth2 is fully working in production
    @PostMapping("/test-login")
    public ResponseEntity<Map<String, String>> testLogin(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (!"testUser".equals(code)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid test code"));
        }
        User testUser = userService.findOrCreateTestUser();
        String token = jwtService.generateToken(testUser.getId(), testUser.getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }
}
