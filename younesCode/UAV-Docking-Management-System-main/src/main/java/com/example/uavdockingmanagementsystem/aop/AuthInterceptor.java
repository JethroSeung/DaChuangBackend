package com.example.uavdockingmanagementsystem.aop;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.example.uavdockingmanagementsystem.common.BaseContext;
import com.example.uavdockingmanagementsystem.model.VO.userVO.UserInfoVO;
import com.example.uavdockingmanagementsystem.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private BaseContext baseContext; // 注入 BaseContext

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 排除不需要鉴权的路径（保持不变）
        String path = request.getRequestURI();
        if (path.startsWith("/user/login") || path.startsWith("/user/register")
                || path.startsWith("/css/") || path.startsWith("/js/") || path.startsWith("/images/")) {
            return true;
        }

        // 获取并验证 Token（保持不变）
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "未提供 Token");
            return false;
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        try {
            // 验证 Token 并解析 claims
            Map<String, Object> claims = JwtUtil.parseToken(token);

            // 关键修改：将 userId 正确转换为 Long（处理 Integer 或 String 类型的情况）
            Object userIdObj = claims.get("userId");
            Long userId;
            if (userIdObj instanceof Integer) {
                userId = ((Integer) userIdObj).longValue(); // Integer 转 Long
            } else if (userIdObj instanceof String) {
                userId = Long.parseLong((String) userIdObj); // String 转 Long
            } else if (userIdObj instanceof Long) {
                userId = (Long) userIdObj; // 本身是 Long 直接使用
            } else {
                throw new IllegalArgumentException("无效的 userId 类型");
            }

            // 创建 UserInfoVO 并设置属性
            UserInfoVO userInfo = new UserInfoVO();
            userInfo.setUserId(userId);
            userInfo.setUserType((String) claims.get("userType")); // 其他属性保持不变

            // 存入 BaseContext
            baseContext.setCurrentUser(userInfo);
            return true;
        } catch (JWTVerificationException | IllegalArgumentException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "无效的 Token：" + e.getMessage());
            return false;
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 清理 BaseContext（如果使用 ThreadLocal 实现）
        baseContext.removeCurrentUser();
    }
}