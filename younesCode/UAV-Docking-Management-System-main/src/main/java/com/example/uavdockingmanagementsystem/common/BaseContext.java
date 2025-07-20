package com.example.uavdockingmanagementsystem.common;

import com.example.uavdockingmanagementsystem.model.VO.userVO.UserInfoVO;
import org.springframework.stereotype.Component;

@Component
public class BaseContext {
    private static final ThreadLocal<UserInfoVO> threadLocal = new ThreadLocal<>();

    /**
     * 设置当前用户信息
     */
    public void setCurrentUser(UserInfoVO user) {
        threadLocal.set(user);
    }

    /**
     * 获取当前用户信息
     */
    public UserInfoVO getCurrentUser() {
        return threadLocal.get();
    }

    /**
     * 移除当前用户信息（必须在请求结束时调用，避免内存泄漏）
     */
    public void removeCurrentUser() {
        threadLocal.remove();
    }
}