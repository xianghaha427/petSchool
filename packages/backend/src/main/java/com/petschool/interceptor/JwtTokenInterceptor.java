package com.petschool.interceptor;

import com.petschool.common.constant.JwtConstant;
import com.petschool.dto.jwt.JwtProperties;
import com.petschool.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@Slf4j
public class JwtTokenInterceptor implements HandlerInterceptor{
    @Autowired
    private JwtProperties jwtProperties;

    // 请求属性 key，用于存储用户 ID
    public static final String USER_ID_KEY = "currentUserId";
    // 请求属性 key，用于存储用户角色
    public static final String USER_ROLE_KEY = "currentUserRole";

    //校验jwt

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //判断当前拦截的是不是controller方法
        if(!(handler instanceof HandlerMethod)){
            //拦截的不是动态方法,直接放行
            return true;
        }
        //1.从请求头中获取令牌
        String token = request.getHeader(jwtProperties.getTokenName());
        //2.校验令牌
        try {
            log.info("jwt校验:{}", token);
            Claims claims = JwtUtil.parseJwt(jwtProperties.getSecretKey(), token);
            Long userId = Long.valueOf(claims.get(JwtConstant.USER_ID).toString());
            Integer userRole = Integer.valueOf(claims.get(JwtConstant.USER_ROLE).toString());
            log.info("当前用户id：{}，角色：{}", userId, userRole);

            // 将用户信息存储到请求属性中，供后续使用
            request.setAttribute(USER_ID_KEY, userId);
            request.setAttribute(USER_ROLE_KEY, userRole);

            //3.通过，放行
            return true;
        }catch (Exception e){
            response.setStatus(401);
            return false;
        }
    }
}
