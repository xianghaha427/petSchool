package com.petschool.common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 响应码枚举的约束测试
 */
class ResultCodeTest {

    @Test
    @DisplayName("所有枚举 code 唯一，不出现撞号")
    void codesShouldBeUnique() {
        Map<Integer, ResultCode> seen = new HashMap<>();
        Set<String> duplicates = new HashSet<>();

        for (ResultCode rc : ResultCode.values()) {
            ResultCode previous = seen.put(rc.getCode(), rc);
            if (previous != null) {
                duplicates.add(previous.name() + " 与 " + rc.name() + " 都是 " + rc.getCode());
            }
        }

        // 撞号不会报错，只会让前端拿到一张错误的文案：
        // 例如复用 1005 会让养护建议失败时显示「AI 识别失败」。
        assertTrue(duplicates.isEmpty(), "存在重复的响应码：" + duplicates);
    }

    @Test
    @DisplayName("失败码都有非空文案——前端会把它直接展示给用户")
    void codesShouldHaveMessage() {
        for (ResultCode rc : ResultCode.values()) {
            assertTrue(rc.getMessage() != null && !rc.getMessage().isBlank(),
                    rc.name() + " 的 message 为空");
        }
    }

    @Test
    @DisplayName("1006 归图片上传，养护建议用 1007——这次踩过的坑")
    void generateFailedShouldNotReuseUploadCode() {
        assertEquals(1006, ResultCode.FILE_UPLOAD_FAILED.getCode());
        assertEquals(1007, ResultCode.AI_GENERATE_FAILED.getCode());
    }
}
