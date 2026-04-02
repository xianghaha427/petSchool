package com.petschool.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

@Data
@Schema(description = "用户信息")
public class UserDTO implements Serializable {
    //主键 ID
    @Schema(description = "用户ID")
    private Long id;

    @Schema(description = "用户名")
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 64, message = "用户名长度必须在3-64字符之间")
    private String userName;

    @Schema(description = "密码")
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 64, message = "密码长度必须在6-64字符之间")
    private String password;

    @Schema(description = "手机号")
    @Size(max = 32, message = "手机号不能超过32字符")
    private String phone;

    @Schema(description = "邮箱")
    @Size(max = 128, message = "邮箱不能超过128字符")
    private String email;
}
