package com.example.uavdockingmanagementsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UavDockingManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(UavDockingManagementSystemApplication.class, args);
        System.out.println("welcome to the UAV Docking Management System");
        System.out.println("CONGRATULATIONS  FINALLY IT'S WORKING! :)");
        // THE PROJECT IS DEPLOYED ON railway.com BY THE TWO DOCKER IMAGES APP and DB
        //// THE APP IS RUNNING ON PORT 8080
        
        // TODO: Future work - implement Spring Security or JWT for authentication and authorization
        // This will enhance the system's security by providing:
        // - User authentication
        // - Role-based access control
        // - Protected API endpoints
        // - Secure token-based authentication


    }
}
