package com.example.uavdockingmanagementsystem.model.DTO.page;

import lombok.Data;

import java.io.Serializable;

@Data
public class PageDTO implements Serializable {

    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String order = "desc";
    private String orderBy = "createTime";


}
