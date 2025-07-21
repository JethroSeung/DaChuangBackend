package com.example.uavdockingmanagementsystem.aop;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.uavdockingmanagementsystem.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 排除不需要鉴权的路径
        String path = request.getRequestURI();
        if (path.startsWith("/user/login") || path.startsWith("/user/register")
                || path.startsWith("/css/") || path.startsWith("/js/") || path.startsWith("/images/")) {
            return true;
        }

        // 获取 Token（从请求头中）
        String token = request.getHeader("Authorization");

        // 检查 Token 是否存在
        if (token == null || token.isEmpty()) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "未提供 Token");
            return false;
        }

        // 去除 "Bearer " 前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        try {
            // 验证 Token
            Map<String, Object> claims = JwtUtil.parseToken(token);

            // 将用户信息存入请求属性，方便后续控制器使用
            request.setAttribute("userId", claims.get("userId"));
            request.setAttribute("userType", claims.get("userType"));

            return true;
        } catch (JWTVerificationException e) {
            // Token 无效
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "无效的 Token");
            return false;
        }
    }
}