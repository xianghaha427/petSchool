package com.petschool.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.petschool.common.constant.ActivityConstant;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 创建校园活动 DTO
 * <p>
 * 时间字段叫 startAt/endAt（对应前端既有字段名），实体里叫 startTime/endTime
 * （对应数据库列 start_time/end_time），映射在 ActivityServiceImpl 里做。
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "创建校园活动请求")
public class ActivityCreateDTO implements Serializable {

    @Schema(description = "活动标题")
    @NotBlank(message = "活动标题不能为空")
    @Size(max = 128, message = "活动标题不能超过128字符")
    private String title;

    @Schema(description = "活动简介")
    @Size(max = 512, message = "活动简介不能超过512字符")
    private String description;

    @Schema(description = "活动地点")
    @NotBlank(message = "活动地点不能为空")
    @Size(max = 128, message = "活动地点不能超过128字符")
    private String location;

    /**
     * 前端 &lt;input type="datetime-local"&gt; 只给到分钟（2026-03-15T14:00），
     * 前端提交前会补成完整的 yyyy-MM-ddTHH:mm:ss，这里的 pattern 与之对齐。
     */
    @Schema(description = "开始时间，格式 yyyy-MM-ddTHH:mm:ss")
    @NotNull(message = "开始时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startAt;

    @Schema(description = "结束时间，格式 yyyy-MM-ddTHH:mm:ss")
    @NotNull(message = "结束时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endAt;

    @Schema(description = "封面图 URL，可为空")
    @Size(max = 512, message = "封面图地址不能超过512字符")
    private String coverUrl;

    /**
     * 配色是纯装饰性的，所以不标 @NotBlank：漏传时服务端回落到默认主题，
     * 而不是让用户因为一个颜色拿不到 400。@Pattern 对 null 放行，只拦非法值。
     */
    @Schema(description = "卡片配色主题键，可选值：teal/orange/pink/blue/red/purple")
    @Pattern(regexp = ActivityConstant.THEME_REGEX, message = "配色主题取值非法")
    private String theme;
}
