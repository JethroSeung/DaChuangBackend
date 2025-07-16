package com.example.uavdockingmanagementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    private Integer isDelete;

    private LocalDateTime lastLoginTime;

    private String lastLoginIp;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}