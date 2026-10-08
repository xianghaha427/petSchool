package com.petschool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 活动报名实体类
 * <p>
 * activity_id + user_id 上有唯一键 uk_activity_user，一个用户对同一活动只能报名一次。
 * 这既是业务规则，也是防重复提交的最终防线（service 层的前置查询在并发下挡不住）。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("activity_signup")
public class ActivitySignup {

    /**
     * 主键 ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 活动 ID
     */
    private Long activityId;

    /**
     * 报名用户 ID
     */
    private Long userId;

    /**
     * 宠物姓名
     */
    private String petName;

    /**
     * 主人姓名
     */
    private String ownerName;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 备注
     */
    private String note;

    /**
     * 报名时间
     */
    private LocalDateTime createTime;
}
