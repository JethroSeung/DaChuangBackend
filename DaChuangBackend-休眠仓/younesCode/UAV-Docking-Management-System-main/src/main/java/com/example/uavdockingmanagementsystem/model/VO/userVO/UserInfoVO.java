package com.example.uavdockingmanagementsystem.model.VO.userVO;

import lombok.Data;

import java.io.Serializable;

@Data
public class UserInfoVO implements Serializable {
    private Long userId;
    private String userType;
    private String userName;
    private String token;

}