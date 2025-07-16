package com.example.uavdockingmanagementsystem.model.VO.userVO;

import lombok.Data;

import java.io.Serializable;

@Data
public class LoginVO implements Serializable {
    private String token;
    private boolean needComplete;

}