package com.gotogether.reservationms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients("com.gotogether.reservationms")
public class ReservationmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReservationmsApplication.class, args);
	}

}
