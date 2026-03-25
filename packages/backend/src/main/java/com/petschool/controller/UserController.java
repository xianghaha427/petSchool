package com.petschool.controller;


import com.petschool.common.Result;
import com.petschool.common.constant.JwtConstant;
import com.petschool.dto.UserDTO;
import com.petschool.dto.jwt.JwtProperties;
import com.petschool.entity.User;
import com.petschool.service.UserService;
import com.petschool.utils.JwtUtil;
import com.petschool.vo.UserLoginVO;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(name="用户相关功能")
@RestController
@RequestMapping("/users")
@Slf4j
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtProperties jwtProperties;

    //用户查询
    @GetMapping("/{id}")
    public Result getUser(@PathVariable("id") Long userId){
        log.info("查询用户");
        User user=userService.getbyId(userId);
        return Result.success(user);
    }

    //用户登录
    @PostMapping("/login")
    public Result login(@RequestBody UserDTO userDTO){
        log.info("用户登录");
        User user=userService.login(userDTO);
        //生成jwt令牌
        Map<String,Object> claims=new HashMap<>();
        claims.put(JwtConstant.USER_ID,user.getId());
        String token = JwtUtil.createJwt(jwtProperties.getSecretKey(), jwtProperties.getTtl(), claims);
        //生成视图对象返回
        UserLoginVO userLoginVO=UserLoginVO.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .token(token)
                .build();
        return Result.success(userLoginVO);
    }
    //用户注册
    @PostMapping("/register")
    public Result register(@RequestBody UserDTO userDTO){
        log.info("用户注册");
        userService.register(userDTO);
        return Result.success();
    }
}
