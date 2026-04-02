package com.petschool.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 用户资料更新 DTO
 */
@Data
public class UserProfileUpdateDTO implements Serializable {

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 头像 URL
     */
    private String avatarUrl;
}
