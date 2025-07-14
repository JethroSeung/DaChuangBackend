package com.example.uavdockingmanagementsystem.model;
import jakarta.persistence.Entity;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class HibernatePod {  //休眠仓类
    private int maxCapacity = 5; // 休眠仓最大容量
    private Set<UAV> uavs = new HashSet<>();

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
}
