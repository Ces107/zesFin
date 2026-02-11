package ces107.zesFin.repository;

import ces107.zesFin.model.FireProfile;
import ces107.zesFin.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FireProfileRepository extends JpaRepository<FireProfile, Long> {

    List<FireProfile> findAllByUser(User user);

    Optional<FireProfile> findByIdAndUser(Long id, User user);
}
