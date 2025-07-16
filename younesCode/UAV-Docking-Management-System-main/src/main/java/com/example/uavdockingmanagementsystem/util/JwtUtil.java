package com.example.uavdockingmanagementsystem.util;

import com.example.uavdockingmanagementsystem.model.User;
import com.example.uavdockingmanagementsystem.model.VO.userVO.LoginVO;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;


public class JwtUtil {

    private static final String KEY = "your_secret_key";
    private static final Integer EXPIRE_TIME = 1000 * 60 * 60 * 12 * 7; // 7天

    // 接收业务数据,生成token并返回
    public static LoginVO loginStatus(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("userType", user.getUserType());

        String token = JWT.create()
                .withClaim("claims", claims)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRE_TIME))
                .sign(Algorithm.HMAC256(KEY));
        LoginVO loginVO = new LoginVO();
        loginVO.setToken(token);
        loginVO.setNeedComplete(user.getPhone() == null);
        return loginVO;
    }

    // 接收token,验证token,并返回业务数据
    public static Map<String, Object> parseToken(String token) {
        return JWT.require(Algorithm.HMAC256(KEY))
                .build()
                .verify(token)
                .getClaim("claims")
                .asMap();
    }
}
