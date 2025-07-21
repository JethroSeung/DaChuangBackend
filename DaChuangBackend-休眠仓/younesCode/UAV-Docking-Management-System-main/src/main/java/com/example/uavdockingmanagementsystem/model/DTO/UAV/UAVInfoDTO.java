package com.example.uavdockingmanagementsystem.model.DTO.UAV;

import lombok.Data;

@Data
public class UAVInfoDTO {
    private int id;
    private String rfidTag;
    private String ownerName;
    private String model;
    private String status;
    private String hibernatePodJoinTime;
}
