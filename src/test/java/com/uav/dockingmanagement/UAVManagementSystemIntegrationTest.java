package com.uav.dockingmanagement;

import com.uav.dockingmanagement.config.TestRateLimitingConfig;
import com.uav.dockingmanagement.model.HibernatePod;
import com.uav.dockingmanagement.model.Region;
import com.uav.dockingmanagement.model.UAV;
import com.uav.dockingmanagement.repository.RegionRepository;
import com.uav.dockingmanagement.repository.UAVRepository;
import com.uav.dockingmanagement.service.RegionService;
import com.uav.dockingmanagement.service.UAVService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive integration tests for UAV Management System
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Import(TestRateLimitingConfig.class)
@Transactional
public class UAVManagementSystemIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UAVRepository uavRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private UAVService uavService;

    @Autowired
    private RegionService regionService;

    @Autowired
    private HibernatePod hibernatePod;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        
        // Clean up data before each test
        uavRepository.deleteAll();
        regionRepository.deleteAll();
        
        // Initialize test regions
        regionService.initializeSampleRegions();
    }

    @Test
    void testCreateAndRetrieveUAV() {
        // Create a test UAV
        UAV uav = new UAV();
        uav.setRfidTag("TEST001");
        uav.setOwnerName("Test Owner");
        uav.setModel("Test Model");
        uav.setStatus(UAV.Status.AUTHORIZED);
        uav.setInHibernatePod(false);

        UAV savedUAV = uavService.addUAV(uav);
        assertNotNull(savedUAV.getId());
        assertEquals("TEST001", savedUAV.getRfidTag());
        assertEquals("Test Owner", savedUAV.getOwnerName());
        assertEquals(UAV.Status.AUTHORIZED, savedUAV.getStatus());
        assertFalse(savedUAV.isInHibernatePod());
    }

    @Test
    void testHibernatePodFunctionality() {
        // Create test UAVs
        UAV uav1 = createTestUAV("HIBERNATE001", "Owner1", "Model1");
        UAV uav2 = createTestUAV("HIBERNATE002", "Owner2", "Model2");

        // Test adding UAV to hibernate pod
        assertTrue(hibernatePod.addUAV(uav1));
        assertTrue(uav1.isInHibernatePod());
        assertEquals(1, hibernatePod.getCurrentCapacity());

        // Test adding second UAV
        assertTrue(hibernatePod.addUAV(uav2));
        assertTrue(uav2.isInHibernatePod());
        assertEquals(2, hibernatePod.getCurrentCapacity());

        // Test removing UAV from hibernate pod
        hibernatePod.removeUAV(uav1);
        assertFalse(uav1.isInHibernatePod());
        assertEquals(1, hibernatePod.getCurrentCapacity());

        // Test hibernate pod capacity limit
        for (int i = 0; i < 5; i++) {
            UAV testUAV = createTestUAV("CAPACITY" + i, "Owner" + i, "Model" + i);
            hibernatePod.addUAV(testUAV);
        }
        assertTrue(hibernatePod.isFull());
        
        UAV extraUAV = createTestUAV("EXTRA", "Extra Owner", "Extra Model");
        assertFalse(hibernatePod.addUAV(extraUAV));
    }

    @Test
    void testRegionAssignment() {
        // Create test UAV and region
        UAV uav = createTestUAV("REGION001", "Region Owner", "Region Model");
        Region region = regionService.createRegion("Test Region");

        // Test adding region to UAV
        UAV updatedUAV = uavService.addRegionToUAV(uav.getId(), region.getId());
        assertNotNull(updatedUAV);
        assertTrue(updatedUAV.getRegions().contains(region));

        // Test removing region from UAV
        UAV removedRegionUAV = uavService.removeRegionFromUAV(uav.getId(), region.getId());
        assertNotNull(removedRegionUAV);
        assertFalse(removedRegionUAV.getRegions().contains(region));
    }

    @Test
    void testAccessControl() {
        // Create test UAV and region
        UAV uav = createTestUAV("ACCESS001", "Access Owner", "Access Model");
        uav.setStatus(UAV.Status.AUTHORIZED);
        uav = uavRepository.save(uav);
        
        Region region = regionService.createRegion("Access Region");
        uavService.addRegionToUAV(uav.getId(), region.getId());

        // Test successful access
        String result = uavService.checkUAVRegionAccess("ACCESS001", "Access Region");
        assertEquals("OPEN THE DOOR", result);

        // Test unauthorized UAV
        uav.setStatus(UAV.Status.UNAUTHORIZED);
        uavRepository.save(uav);
        result = uavService.checkUAVRegionAccess("ACCESS001", "Access Region");
        assertEquals("UAV is not authorized", result);

        // Test non-existent UAV
        result = uavService.checkUAVRegionAccess("NONEXISTENT", "Access Region");
        assertTrue(result.contains("not found"));

        // Test unauthorized region
        uav.setStatus(UAV.Status.AUTHORIZED);
        uavRepository.save(uav);
        result = uavService.checkUAVRegionAccess("ACCESS001", "Unauthorized Region");
        assertTrue(result.contains("not authorized for region"));
    }

    @Test
    void testRFIDValidation() {
        // Create test UAV
        UAV uav = createTestUAV("RFID001", "RFID Owner", "RFID Model");

        // Test unique RFID
        assertTrue(uavService.isRfidTagUnique("UNIQUE001", null));

        // Test non-unique RFID
        assertFalse(uavService.isRfidTagUnique("RFID001", null));

        // Test updating same UAV with same RFID (should be allowed)
        assertTrue(uavService.isRfidTagUnique("RFID001", uav.getId()));
    }

    @Test
    void testUAVValidation() {
        UAV validUAV = new UAV();
        validUAV.setRfidTag("VALID001");
        validUAV.setOwnerName("Valid Owner");
        validUAV.setModel("Valid Model");
        validUAV.setStatus(UAV.Status.AUTHORIZED);

        assertTrue(uavService.validateUAV(validUAV));

        // Test invalid UAVs
        UAV invalidUAV1 = new UAV();
        assertFalse(uavService.validateUAV(invalidUAV1)); // Missing all fields

        UAV invalidUAV2 = new UAV();
        invalidUAV2.setRfidTag("");
        invalidUAV2.setOwnerName("Owner");
        invalidUAV2.setModel("Model");
        invalidUAV2.setStatus(UAV.Status.AUTHORIZED);
        assertFalse(uavService.validateUAV(invalidUAV2)); // Empty RFID
    }

    @Test
    void testStatistics() {
        // Create test data
        UAV authorizedUAV = createTestUAV("AUTH001", "Auth Owner", "Auth Model");
        authorizedUAV.setStatus(UAV.Status.AUTHORIZED);
        uavRepository.save(authorizedUAV);

        UAV unauthorizedUAV = createTestUAV("UNAUTH001", "Unauth Owner", "Unauth Model");
        unauthorizedUAV.setStatus(UAV.Status.UNAUTHORIZED);
        uavRepository.save(unauthorizedUAV);

        UAV hibernatingUAV = createTestUAV("HIBER001", "Hiber Owner", "Hiber Model");
        hibernatingUAV.setInHibernatePod(true);
        uavRepository.save(hibernatingUAV);
        hibernatePod.addUAV(hibernatingUAV);

        // Test statistics
        assertEquals(1, uavService.getUAVsByStatus(UAV.Status.AUTHORIZED).size());
        assertEquals(1, uavService.getUAVsByStatus(UAV.Status.UNAUTHORIZED).size());
        assertEquals(1, uavService.getUAVsInHibernatePod().size());
        assertEquals(1, uavService.countUAVsInHibernatePod());
    }

    @Test
    void testAPIEndpoints() throws Exception {
        // Test GET /api/uav/all
        mockMvc.perform(get("/api/uav/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        // Test GET /api/hibernate-pod/status
        mockMvc.perform(get("/api/hibernate-pod/status"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.maxCapacity").value(5))
                .andExpect(jsonPath("$.currentCapacity").exists())
                .andExpect(jsonPath("$.isFull").exists());

        // Test GET /api/uav/statistics
        mockMvc.perform(get("/api/uav/statistics"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalUAVs").exists())
                .andExpect(jsonPath("$.hibernatePodCapacity").value(5));

        // Test RFID validation
        mockMvc.perform(get("/api/uav/validate-rfid/TEST123"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.isUnique").value(true));
    }

    @Test
    void testHibernatePodAPIEndpoints() throws Exception {
        // Create test UAV
        UAV testUAV = createTestUAV("API001", "API Owner", "API Model");

        // Test adding UAV to hibernate pod
        mockMvc.perform(post("/api/hibernate-pod/add")
                .param("uavId", String.valueOf(testUAV.getId())))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true));

        // Test removing UAV from hibernate pod
        mockMvc.perform(post("/api/hibernate-pod/remove")
                .param("uavId", String.valueOf(testUAV.getId())))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true));

        // Test adding non-existent UAV
        mockMvc.perform(post("/api/hibernate-pod/add")
                .param("uavId", "99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void testAccessControlAPI() throws Exception {
        // Create test UAV and region
        UAV uav = createTestUAV("ACCESS_API001", "Access API Owner", "Access API Model");
        Region region = regionService.createRegion("API Access Region");
        uavService.addRegionToUAV(uav.getId(), region.getId());

        // Test successful access validation
        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "ACCESS_API001")
                .param("regionName", "API Access Region"))
                .andExpect(status().isOk())
                .andExpect(content().string("OPEN THE DOOR"));

        // Test failed access validation
        mockMvc.perform(post("/api/access/validate")
                .param("rfidId", "ACCESS_API001")
                .param("regionName", "Unauthorized Region"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("not authorized for region")));
    }

    private UAV createTestUAV(String rfidTag, String ownerName, String model) {
        UAV uav = new UAV();
        uav.setRfidTag(rfidTag);
        uav.setOwnerName(ownerName);
        uav.setModel(model);
        uav.setStatus(UAV.Status.AUTHORIZED);
        uav.setInHibernatePod(false);
        return uavRepository.save(uav);
    }
}
