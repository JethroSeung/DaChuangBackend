package com.example.uavdockingmanagementsystem.model.VO.page;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageVO<T> {
    private List<T> records;      // 分页数据列表
    private Long total;           // 总记录数
    private Long pageNum;         // 当前页码（从1开始）
    private Long pageSize;        // 每页大小
    private Long pages;           // 总页数
    private Boolean hasNext;      // 是否有下一页
    private Boolean hasPrevious;  // 是否有上一页
}