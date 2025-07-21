package com.example.uavdockingmanagementsystem.model.VO.page;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class
ResultPageVO<T> implements Serializable {
    private Long total;
    private Long pages;
    private Long pageNum;
    private Long pageSize;
    private List<T> data;

}
