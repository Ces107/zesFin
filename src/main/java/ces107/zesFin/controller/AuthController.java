package ces107.zesFin.controller;

import ces107.zesFin.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

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
}
