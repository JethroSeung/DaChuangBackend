package com.example.uavdockingmanagementsystem.model.DTO.user;

import com.example.uavdockingmanagementsystem.model.DTO.page.PageDTO;
import lombok.Data;

import java.io.Serializable;

@Data
public class GetUserListForAdminDTO extends PageDTO implements Serializable {
    private String nickname;
    private String userType;
    private String phone;
    private Integer pageNum;
    private Integer pageSize;

    public GetUserListForAdminDTO(Integer pageNum, Integer pageSize) {
        this.pageNum = pageNum;
        this.pageSize = pageSize;
    }
}