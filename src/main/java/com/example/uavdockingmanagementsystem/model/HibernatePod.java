package com.example.uavdockingmanagementsystem.model;

import com.example.uavdockingmanagementsystem.repository.UAVRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class HibernatePod {  //休眠仓类
    private static final Logger logger = LoggerFactory.getLogger(HibernatePod.class);

    private int maxCapacity = 5; // 休眠仓最大容量
    private Set<UAV> uavs = new HashSet<>();

    @Autowired
    private UAVRepository uavRepository;

    /**
     * Initialize hibernate pod by loading UAVs from database that are marked as in hibernate pod
     */
    @PostConstruct
    public void initializeFromDatabase() {
        if (uavRepository != null) {
            try {
                List<UAV> hibernatingUAVs = uavRepository.findByInHibernatePod(true);
                uavs.clear();
                for (UAV uav : hibernatingUAVs) {
                    if (uavs.size() < maxCapacity) {
                        uavs.add(uav);
                    } else {
                        // If more UAVs are marked as hibernating than capacity allows,
                        // remove the excess from hibernate pod
                        uav.setInHibernatePod(false);
                        uavRepository.save(uav);
                    }
                }
                logger.info("Initialized HibernatePod with {} UAVs from database", uavs.size());
            } catch (Exception e) {
                // This can happen during tests or when database tables don't exist yet
                logger.warn("Could not initialize HibernatePod from database: {}. Starting with empty pod.", e.getMessage());
                uavs.clear();
            }
        }
    }

    public boolean addUAV(UAV uav) {
        if (uavs.size() >= maxCapacity) {
            return false; // 已满
        }
        uavs.add(uav);
        uav.setInHibernatePod(true);
        return true;
    }

    public void removeUAV(UAV uav) {
        uavs.remove(uav);
        uav.setInHibernatePod(false);
    }

    public boolean isFull() {
        return uavs.size() >= maxCapacity;
    }

    public int getCurrentCapacity() {
        return uavs.size();
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public Set<UAV> getUAVs() {
        return new HashSet<>(uavs); // Return a copy to prevent external modification
    }

    /**
     * Check if a specific UAV is in the hibernate pod
     */
    public boolean containsUAV(UAV uav) {
        return uavs.contains(uav);
    }

    /**
     * Get available capacity
     */
    public int getAvailableCapacity() {
        return maxCapacity - uavs.size();
    }
}
