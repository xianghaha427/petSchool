package com.petschool.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 宠物养护建议 VO
 * <p>
 * 做成结构化对象而不是 Result&lt;String&gt;，核心理由是 disclaimer 必须由后端持有：
 * advice 是按字符数硬截断的，若把"建议就医"写在模型输出末尾，
 * 一旦超长被截断，这条最重要的安全文案就没了。放在这里模型删不掉。
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "宠物养护建议")
public class PetHealthAdviceVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "养护建议正文，单段纯文本")
    private String advice;

    @Schema(description = "免责声明，由后端固定给出，与模型输出无关")
    private String disclaimer;

    @Schema(description = "本次使用的模型")
    private String model;

    @Schema(description = "是否为降级结果（mock 客户端返回的演示数据）")
    private Boolean degraded;
}
