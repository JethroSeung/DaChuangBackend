package com.example.uavdockingmanagementsystem.model.DTO.user;

import lombok.Data;

import java.io.Serializable;

@Data
public class UpdateUserDTO implements Serializable {
    private Long userId;
    private String nickname;
    private String avatarUrl;
    private String gender;
    private String phone;
}