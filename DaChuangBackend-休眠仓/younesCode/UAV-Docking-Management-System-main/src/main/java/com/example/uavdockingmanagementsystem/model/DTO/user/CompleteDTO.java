package com.example.uavdockingmanagementsystem.model.DTO.user;

import lombok.Data;

import java.io.Serializable;

@Data
public class CompleteDTO implements Serializable {
    private String nickname;
    private String avatarUrl;
    private String gender;
    private String phone;
}