package com.petschool.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 活动时间字段的序列化格式守卫（纯单元测试）
 * <p>
 * 这是本功能里**错也不会报错**的两个雷区之一，所以单独钉住：
 * <p>
 * 1. <b>不加 {@code @JsonFormat}</b>：Jackson 对 {@code LocalDateTime} 默认输出
 *    **数组** {@code [2026,3,15,14,0,0]}。已在本项目实测确认——同一个
 *    {@code GET /api/pets} 响应里，带 {@code @JsonFormat} 的 {@code createTime}
 *    是字符串，没带的 {@code vaccinationDate} 就是 {@code [2026,9,3]}。
 *    前端 {@code new Date([...])} 直接 Invalid Date。
 * 2. <b>写成空格分隔</b>（项目其它地方如 {@code PetVO} 就是
 *    {@code "yyyy-MM-dd HH:mm:ss"}）：{@code new Date('2026-03-15 14:00:00')} 在
 *    <b>Safari / iOS 上返回 Invalid Date</b>。而 activityStatus.ts 的
 *    {@code getActivityStatus} 遇到 NaN 会返回「已结束」——结果是所有活动
 *    在 Safari 上都显示已结束，且全程没有任何报错。
 * <p>
 * 所以这里断言的是「带 T」这个具体形状，不是泛泛地断言"有注解"。
 */
class ActivityVOTimeFormatTest {

    /** 前端 activityStatus.ts 靠 new Date(str) 解析，T 分隔是必须的 */
    private static final List<String> TIME_FIELDS = List.of("startAt", "endAt");

    @Test
    @DisplayName("ActivityVO 的 startAt/endAt 必须带 @JsonFormat 且用 T 分隔")
    void timeFieldsMustUseIsoTFormat() throws Exception {
        for (String name : TIME_FIELDS) {
            Field field = ActivityVO.class.getDeclaredField(name);
            JsonFormat format = field.getAnnotation(JsonFormat.class);

            assertNotNull(format,
                    "ActivityVO." + name + " 必须带 @JsonFormat，否则会序列化成数组 [2026,3,15,14,0,0]");
            assertTrue(format.pattern().contains("'T'"),
                    "ActivityVO." + name + " 的 pattern 必须是 T 分隔（当前为 " + format.pattern()
                            + "）。空格分隔在 Safari/iOS 上是 Invalid Date，会让所有活动显示成「已结束」且不报错");
        }
    }

    @Test
    @DisplayName("T 分隔的具体形状：yyyy-MM-dd'T'HH:mm:ss")
    void patternIsExactlyIsoSeconds() throws Exception {
        Field field = ActivityVO.class.getDeclaredField("startAt");
        assertEquals("yyyy-MM-dd'T'HH:mm:ss", field.getAnnotation(JsonFormat.class).pattern(),
                "这个 pattern 必须与前端 new Date() 能解析、且与 ActivityCreateDTO 的入参格式一致");
    }

    @Test
    @DisplayName("创建活动的入参格式与出参一致（出参能被原样回填进表单）")
    void createDtoUsesSamePatternAsVo() throws Exception {
        Field requestField = com.petschool.dto.ActivityCreateDTO.class.getDeclaredField("startAt");
        Field responseField = ActivityVO.class.getDeclaredField("startAt");

        assertEquals(
                responseField.getAnnotation(JsonFormat.class).pattern(),
                requestField.getAnnotation(JsonFormat.class).pattern(),
                "出入参时间格式不一致时，从列表拿到的时间没法直接回填到编辑/创建请求里");
    }
}
