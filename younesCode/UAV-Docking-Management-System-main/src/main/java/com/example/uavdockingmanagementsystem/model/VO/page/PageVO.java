package com.example.uavdockingmanagementsystem.model.VO.page;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageVO<T> implements Serializable {
    private Long pageNum;
    private Long pageSize;
    private List<T> list;
    private Long pages;
    private Long total;

}