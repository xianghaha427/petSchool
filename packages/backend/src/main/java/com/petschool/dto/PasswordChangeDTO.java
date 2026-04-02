package com.petschool.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * 修改密码 DTO
 */
@Data
public class PasswordChangeDTO implements Serializable {

    /**
     * 旧密码
     */
    private String oldPassword;

    /**
     * 新密码
     */
    private String newPassword;
}
