package ces107.zesFin;

import org.springframework.boot.SpringApplication;

public class TestZesFinApplication {

	public static void main(String[] args) {
		SpringApplication.from(ZesFinApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
