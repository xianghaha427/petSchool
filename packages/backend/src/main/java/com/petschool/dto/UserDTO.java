package com.petschool.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class UserDTO implements Serializable {
    //主键 ID
    private Long id;
    //用户名
    private String userName;
    //密码
    private String password;
    //手机号
    private String phone;
    //邮箱
    private String email;
}
