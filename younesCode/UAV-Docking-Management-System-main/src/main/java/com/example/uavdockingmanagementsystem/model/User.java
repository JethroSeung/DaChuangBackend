package com.example.uavdockingmanagementsystem.model;

import cn.hutool.core.lang.Snowflake;
import cn.hutool.core.util.IdUtil;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class User {

    private static final long serialVersionUID = 1L;

    @Id
    private Long id = IdUtil.createSnowflake(1, 1).nextId(); // 雪花算法生成

    @Column(nullable = false, unique = true)
    private String account;

    @Column(nullable = false)
    private String password;

    private String nickname;

    private String avatarUrl;

    private String phone;

    private String email;

    private String userType; // admin/user

    @Column(updatable = false)
    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private Integer isDelete = 0;

    private LocalDateTime lastLoginTime;

    private String lastLoginIp;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createTime = now;
        updateTime = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}