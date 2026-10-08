package com.petschool.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 校园活动实体类
 * <p>
 * 注意：本类**没有** deleted 字段。application.yml 里全局配了
 * {@code logic-delete-field: deleted}，一旦实体里出现同名字段，MyBatis-Plus 会
 * 自动把它当逻辑删除列，所有查询都会被追加条件。本项目的软删除统一用
 * status 手写（对照 PetServiceImpl）。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@TableName("activity")
public class Activity {

    /**
     * 主键 ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 活动标题
     */
    private String title;

    /**
     * 活动简介
     */
    private String description;

    /**
     * 活动地点
     */
    private String location;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    private LocalDateTime endTime;

    /**
     * 封面图 URL，为空时前端用渐变底色兜底
     */
    private String coverUrl;

    /**
     * 卡片配色主题键（非 Tailwind 类名），见 ActivityConstant.THEME_REGEX
     */
    private String theme;

    /**
     * 状态：0-已下架，1-正常
     */
    private Integer status;

    /**
     * 创建人（管理员）ID
     */
    private Long createUserId;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
