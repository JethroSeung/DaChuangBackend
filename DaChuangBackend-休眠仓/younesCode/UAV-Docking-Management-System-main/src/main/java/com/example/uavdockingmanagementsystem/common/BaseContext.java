package com.example.uavdockingmanagementsystem.common;


import com.example.uavdockingmanagementsystem.model.VO.userVO.UserInfoVO;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

@Component
public class BaseContext {
    private static final String USERINFO = "USERINFO";

    /**
     * Sets current user.
     *
     * @param user the user
     */
    public void setCurrentUser(UserInfoVO user) {
        RequestContextHolder.currentRequestAttributes().setAttribute(USERINFO, user, RequestAttributes.SCOPE_REQUEST);
    }

    /**
     * Gets current user.
     *
     * @return the current user
     */
    public UserInfoVO getCurrentUser() {
        return (UserInfoVO) RequestContextHolder.currentRequestAttributes().getAttribute(USERINFO, RequestAttributes.SCOPE_REQUEST);
    }

}