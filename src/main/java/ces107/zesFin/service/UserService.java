package ces107.zesFin.service;

import ces107.zesFin.model.User;
import ces107.zesFin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    /**
     * Finds an existing user by Google ID or creates a new one.
     *
     * @param googleId Google OAuth2 subject identifier
     * @param email    user email from Google
     * @param name     display name from Google
     * @param pictureUrl profile picture URL from Google
     * @return the persisted User entity
     */
    // TODO: Remove test user method when OAuth2 is fully working in production
    public User findOrCreateTestUser() {
        return repository.findByGoogleId("test-user")
                .map(existing -> {
                    existing.setLastLoginAt(LocalDateTime.now());
                    return repository.save(existing);
                })
                .orElseGet(() -> repository.save(User.builder()
                        .googleId("test-user")
                        .email("test@zesfin.dev")
                        .name("Test User")
                        .pictureUrl("")
                        .build()));
    }

    public User findOrCreateFromGoogle(String googleId, String email, String name, String pictureUrl) {
        return repository.findByGoogleId(googleId)
                .map(existing -> {
                    existing.setName(name);
                    existing.setPictureUrl(pictureUrl);
                    existing.setLastLoginAt(LocalDateTime.now());
                    return repository.save(existing);
                })
                .orElseGet(() -> repository.save(User.builder()
                        .googleId(googleId)
                        .email(email)
                        .name(name)
                        .pictureUrl(pictureUrl)
                        .build()));
    }
}
