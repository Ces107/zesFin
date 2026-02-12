package ces107.zesFin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZesFinApplication {

	public static void main(final String[] args) {
		SpringApplication.run(ZesFinApplication.class, args);
	}

}
