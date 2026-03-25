package com.petschool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.petschool.common.constant.UserConstant;
import com.petschool.dto.UserDTO;
import com.petschool.entity.User;
import com.petschool.mapper.UserMapper;
import com.petschool.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    //按id查询用户
    @Override
    public User getbyId(Long userId) {
        User user = userMapper.selectById(userId);
        return user;
    }

    @Override
    public User login(UserDTO userDTO) {
        String userName=userDTO.getUserName();
        String password=userDTO.getPassword();

        // 使用 QueryWrapper 查询
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", userName);
        User user = userMapper.selectOne(queryWrapper);

        if(user == null){
            throw new RuntimeException("用户不存在");
        }
        //校验密码
        if(!user.getPassword().equals(password)){
            throw new RuntimeException("密码错误");
        }
        return user;
    }

    //用户注册
    @Override
    public void register(UserDTO userDTO) {
        User user=new User();
        //将UserDTO对象的属性复制到User对象中
        BeanUtils.copyProperties(userDTO,user);
        //设置创建时间
        user.setCreateTime(LocalDateTime.now());
        //设置身份
        user.setRole(UserConstant.NORMAL_USER); //0表示普通用户
        //设置状态
        user.setStatus(UserConstant.ENABLE); //1表示正常
        //将用户信息保存到数据库中
        userMapper.insert(user);
    }
}
