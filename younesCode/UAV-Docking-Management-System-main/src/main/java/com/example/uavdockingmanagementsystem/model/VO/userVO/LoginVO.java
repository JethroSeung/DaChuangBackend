package com.example.uavdockingmanagementsystem.model.VO.userVO;

import com.example.uavdockingmanagementsystem.model.User;
import lombok.Data;

import java.io.Serializable;

@Data
public class LoginVO implements Serializable {
    private String token;
    private boolean needComplete;

    private boolean success;       // 登录是否成功（模板用 loginVO.success）
    private String errorMsg;       // 登录失败时的错误信息（模板用 loginVO.errorMsg）
    private User user;             // 登录成功时的用户信息（模板用 loginVO.user.nickname）
}