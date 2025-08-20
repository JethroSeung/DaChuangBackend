package com.uav.dockingmanagement;

import com.uav.dockingmanagement.config.TestRateLimitingConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestRateLimitingConfig.class)
@Transactional
class UavDockingManagementSystemApplicationTests {

    @Autowired
    private TestDataInitializer testDataInitializer;

    @Test
    void contextLoads() {
        // Test that the Spring context loads successfully
        // Initialize test data to verify database connectivity
        testDataInitializer.initializeTestData();
    }

}
