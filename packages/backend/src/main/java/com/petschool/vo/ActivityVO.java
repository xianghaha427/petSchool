package com.petschool.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 校园活动 VO
 * <p>
 * 不含「报名中/即将开始/进行中/已结束」状态——那是前端 activityStatus.ts 按
 * 当前时间实时算出来的，落库会立刻过期。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "校园活动信息")
public class ActivityVO implements Serializable {

    @Schema(description = "活动ID")
    private Long id;

    @Schema(description = "活动标题")
    private String title;

    @Schema(description = "活动简介")
    private String description;

    @Schema(description = "活动地点")
    private String location;

    /**
     * 必须是「T 分隔」而不是 PetVO 那种「空格分隔」。
     * <p>
     * 前端 activityStatus.ts 用 {@code new Date(startAt)} 解析，而
     * {@code new Date('2026-03-15 14:00:00')}（带空格）在 Safari/iOS 上返回
     * Invalid Date，会走到 getActivityStatus 的 NaN 分支——结果是**所有活动都
     * 显示「已结束」，且不报任何错**。不要为了跟 PetVO 统一而把它改成空格。
     */
    @Schema(description = "开始时间，格式 yyyy-MM-ddTHH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startAt;

    /** 同 startAt，见上面的说明 */
    @Schema(description = "结束时间，格式 yyyy-MM-ddTHH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endAt;

    @Schema(description = "封面图 URL，可能为空")
    private String coverUrl;

    @Schema(description = "卡片配色主题键，前端据此查固定映射表")
    private String theme;

    @Schema(description = "已报名人数，实时统计")
    private Integer participants;

    /**
     * 当前用户是否已报名。
     * <p>
     * 列表接口是匿名放行的，拿不到 userId，所以那里恒为 false；
     * 只有 /my-activities 会置 true。首页靠这个接口得出「已报名」的按钮态。
     */
    @Schema(description = "当前用户是否已报名")
    private Boolean signedUp;
}
