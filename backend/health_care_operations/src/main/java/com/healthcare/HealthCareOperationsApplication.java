package com.healthcare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HealthCareOperationsApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthCareOperationsApplication.class, args);
    }
}
