package com.gotogether.notificationms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients("com.gotogether.notificationms.repository")
public class NotificationmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotificationmsApplication.class, args);
	}

}
