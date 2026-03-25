package com.petschool.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

public class JwtUtil {

    // 生成jwt
    public static String createJwt(String secretKey, Long ttl, Map<String, Object> claims) {
        // 使用 HS256 算法
        SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
        // 将密钥转换为 Key 对象
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        // 设置过期时间
        long expMillis = System.currentTimeMillis() + ttl;
        Date exp = new Date(expMillis);

        // 生成jwt
        String jwt = Jwts.builder()
                .setClaims(claims)  // 设置payload
                .signWith(key, signatureAlgorithm)  // 新版本使用 Key 对象
                .setExpiration(exp)  // 设置过期时间
                .compact();  // 生成jwt字符串
        return jwt;
    }

    // 解码jwt
    public static Claims parseJwt(String secretKey, String token) {
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        Claims claims = Jwts.parserBuilder()  // 新版本使用 parserBuilder()
                .setSigningKey(key)  // 设置签名密钥
                .build()  // 构建解析器
                .parseClaimsJws(token)  // 新版本使用 parseClaimsJws
                .getBody();  // 获取payload
        return claims;
    }
}