package com.example.uavdockingmanagementsystem.model;
import jakarta.persistence.Entity;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class HibernatePod {  //休眠仓类
    private int maxCapacity = 5; // 休眠仓最大容量
    @Getter
    private Set<UAV> uavs = new HashSet<>(); //存放在休眠仓里的无人机
    private Map<UAV, LocalDateTime> joinTimes = new HashMap<>();//由于不是每个uav都在休眠仓里，所以使用键值对来存储

    public boolean addUAV(UAV uav) {
        if (uavs.size() >= maxCapacity) {
            return false; // 已满
        }
        uavs.add(uav);
        LocalDateTime nowTime = LocalDateTime.now();
        uav.setHibernatePodJoinTime(nowTime); // 设置加入时间
        joinTimes.put(uav, nowTime); // 记录加入时间
        uav.setInHibernatePod(true);
        return true;
    }

    public void removeUAV(UAV uav) {
        uavs.remove(uav);
        joinTimes.remove(uav); // 移除加入时间记录
        uav.setInHibernatePod(false);
    }

    public boolean isFull() {
        return uavs.size() >= maxCapacity;
    }

    public int getCurrentCapacity() {
        return uavs.size();
    }

    public Duration getUAVStayDuration(UAV uav) {  // 获取无人机在休眠仓的停留时间，用于后续调度
        if (!joinTimes.containsKey(uav)) {
            return Duration.ZERO; // UAV未加入休眠仓
        }
        return Duration.between(joinTimes.get(uav), LocalDateTime.now());
    }
}
