package com.uav.dockingmanagement.config;

import graphql.scalars.ExtendedScalars;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

/**
 * GraphQL configuration for the UAV Docking Management System
 * Configures custom scalars and runtime wiring
 */
@Configuration
public class GraphQLConfig {

    /**
     * Configure GraphQL runtime wiring with custom scalars
     */
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(ExtendedScalars.DateTime)
                .scalar(ExtendedScalars.Object)
                .scalar(ExtendedScalars.Date)
                .scalar(ExtendedScalars.Time)
                .scalar(ExtendedScalars.LocalTime)
                .scalar(ExtendedScalars.PositiveInt)
                .scalar(ExtendedScalars.NonNegativeInt)
                .scalar(ExtendedScalars.PositiveFloat)
                .scalar(ExtendedScalars.NonNegativeFloat);
    }
}
