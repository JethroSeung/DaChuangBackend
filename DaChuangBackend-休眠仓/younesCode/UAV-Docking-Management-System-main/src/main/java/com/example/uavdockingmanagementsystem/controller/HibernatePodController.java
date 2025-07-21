package com.example.uavdockingmanagementsystem.controller;

import com.example.uavdockingmanagementsystem.model.DTO.UAV.UAVInfoDTO;
import com.example.uavdockingmanagementsystem.model.HibernatePod;
import com.example.uavdockingmanagementsystem.model.UAV;
import com.example.uavdockingmanagementsystem.repository.UAVRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class HibernatePodController {
    @Autowired
    private UAVRepository uavRepository;
    @Autowired
    private HibernatePod hibernatePod;
    @PostMapping("/hibernate-pod/add")
    public String addUAVToHibernatePod(@RequestParam int uavId, Model model) {
        UAV uav = uavRepository.findById(uavId).orElseThrow();
        if (hibernatePod.isFull()) {
            model.addAttribute("message", "休眠仓已满！");
        } else {
            hibernatePod.addUAV(uav);
            uavRepository.save(uav);
            model.addAttribute("message", "无人机已加入休眠仓");
        }
        return "hibernate-pod-status";
    }

    @GetMapping("/hibernate-pod/uavs")
    public List<UAVInfoDTO> getUAVsInHibernatePod() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return hibernatePod.getUavs().stream().map(uav -> {
            UAVInfoDTO dto = new UAVInfoDTO();
            dto.setId(uav.getId());
            dto.setRfidTag(uav.getRfidTag());
            dto.setOwnerName(uav.getOwnerName());
            dto.setModel(uav.getModel());
            dto.setStatus(uav.getStatus().name());
            dto.setHibernatePodJoinTime(uav.getHibernatePodJoinTime() != null
                    ? uav.getHibernatePodJoinTime().format(formatter)
                    : "未加入");
            return dto;
        }).collect(Collectors.toList());
    }
}
