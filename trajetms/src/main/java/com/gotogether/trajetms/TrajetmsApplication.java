package com.gotogether.trajetms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class TrajetmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrajetmsApplication.class, args);
	}

}
