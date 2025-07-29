package com.uav.dockingmanagement;

import com.uav.dockingmanagement.config.TestRateLimitingConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestRateLimitingConfig.class)
class UavDockingManagementSystemApplicationTests {

    @Test
    void contextLoads() {
    }

}
