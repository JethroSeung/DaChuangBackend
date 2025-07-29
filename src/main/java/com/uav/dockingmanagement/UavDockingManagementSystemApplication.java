package com.uav.dockingmanagement;

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

        // Security has been implemented with Spring Security
        // Features include:
        // - User authentication with role-based access control
        // - Protected API endpoints based on user roles
        // - Secure login/logout functionality
        // - Default users: admin/admin123, operator/operator123, user/user123


    }
}
