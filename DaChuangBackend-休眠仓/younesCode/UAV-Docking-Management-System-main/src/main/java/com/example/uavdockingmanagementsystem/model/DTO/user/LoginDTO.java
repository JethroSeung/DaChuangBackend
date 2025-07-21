package com.example.uavdockingmanagementsystem.model.DTO.user;


import lombok.Data;

import java.io.Serializable;

@Data
public class LoginDTO implements Serializable {

    private String account;
    private String password;

}
