package com.example.uavdockingmanagementsystem.model.DTO.user;

import lombok.Data;

@Data
public class RegisterDTO extends LoginDTO {
    private String nickname;
    private String phone;
    private String email;

}
