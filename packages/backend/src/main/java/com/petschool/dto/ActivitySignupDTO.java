package com.petschool.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 活动报名 DTO
 * <p>
 * 字段与 ActivityRegisterModal 的表单一一对应。宠物名是自由文本，不与 pet 表关联
 * （用户可能还没登记宠物），这是既有表单的设计，本次不改。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "活动报名请求")
public class ActivitySignupDTO implements Serializable {

    @Schema(description = "宠物姓名")
    @NotBlank(message = "宠物姓名不能为空")
    @Size(max = 64, message = "宠物姓名不能超过64字符")
    private String petName;

    @Schema(description = "主人姓名")
    @NotBlank(message = "主人姓名不能为空")
    @Size(max = 64, message = "主人姓名不能超过64字符")
    private String ownerName;

    @Schema(description = "手机号")
    @NotBlank(message = "手机号不能为空")
    @Size(max = 32, message = "手机号不能超过32字符")
    private String phone;

    /**
     * 选填。空串是前端表单的默认值，@Email 对空串放行，不会误报。
     */
    @Schema(description = "邮箱，选填")
    @Email(message = "邮箱格式不正确")
    @Size(max = 128, message = "邮箱不能超过128字符")
    private String email;

    @Schema(description = "备注，选填")
    @Size(max = 256, message = "备注不能超过256字符")
    private String note;
}
