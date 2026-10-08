package com.petschool.utils;

import com.petschool.common.ResultCode;
import com.petschool.common.constant.UserConstant;
import com.petschool.common.exception.BusinessException;
import com.petschool.entity.User;
import com.petschool.interceptor.JwtTokenInterceptor;
import com.petschool.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 管理员权限校验器
 * <p>
 * 从请求属性中取出 JWT 拦截器写入的当前用户 id，再查库确认其角色为管理员。
 * 校验不通过直接抛 BusinessException(403)。
 */
@Component
public class AdminChecker {

    @Autowired
    private UserMapper userMapper;

    /**
     * 校验当前请求的登录用户是否为管理员
     *
     * @return 当前管理员用户，调用方需要用户 id 时可直接使用
     */
    public User check(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute(JwtTokenInterceptor.USER_ID_KEY);
        User user = userMapper.selectById(userId);
        if (user == null || !UserConstant.EMPLOYEE.equals(user.getRole())) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无管理员权限");
        }
        return user;
    }
}
