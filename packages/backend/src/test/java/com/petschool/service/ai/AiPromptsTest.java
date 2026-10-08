package com.petschool.service.ai;

import com.petschool.dto.ai.PetDescriptionRequest;
import com.petschool.dto.ai.PetHealthAdviceRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 提示词拼串的纯单元测试
 */
class AiPromptsTest {

    private PetHealthAdviceRequest fullRequest() {
        PetHealthAdviceRequest req = new PetHealthAdviceRequest();
        req.setName("小毛");
        req.setSpecies("dog");
        req.setBreed("腊肠犬");
        req.setAgeMonths(16);
        req.setGender(1);
        req.setWeight(new BigDecimal("5.50"));
        req.setIsVaccinated(1);
        req.setIsNeutered(0);
        req.setHealthStatus("近期有点挑食");
        return req;
    }

    @Test
    @DisplayName("养护建议：全字段都拼进用户指令")
    void healthAdviceUser_shouldIncludeAllFields() {
        String text = AiPrompts.healthAdviceUser(fullRequest());

        assertTrue(text.contains("名字：小毛"), text);
        assertTrue(text.contains("种类：狗狗"), text);
        assertTrue(text.contains("品种：腊肠犬"), text);
        assertTrue(text.contains("月龄：16"), text);
        assertTrue(text.contains("性别：公"), text);
        assertTrue(text.contains("已接种疫苗：是"), text);
        assertTrue(text.contains("已绝育：否"), text);
        assertTrue(text.contains("健康状况说明：近期有点挑食"), text);
    }

    @Test
    @DisplayName("养护建议：体重去掉无意义的尾零，5.50 写成 5.5")
    void healthAdviceUser_shouldStripWeightTrailingZeros() {
        String text = AiPrompts.healthAdviceUser(fullRequest());
        assertTrue(text.contains("体重：5.5kg"), text);
        assertFalse(text.contains("5.50"), text);
    }

    @Test
    @DisplayName("养护建议：空字段整个省略，不出现空标签")
    void healthAdviceUser_shouldOmitBlankFields() {
        PetHealthAdviceRequest req = new PetHealthAdviceRequest();
        req.setSpecies("cat");

        String text = AiPrompts.healthAdviceUser(req);

        assertTrue(text.contains("种类：猫咪"), text);
        assertFalse(text.contains("名字"), text);
        assertFalse(text.contains("品种"), text);
        assertFalse(text.contains("月龄"), text);
        assertFalse(text.contains("体重"), text);
        assertFalse(text.contains("健康状况说明"), text);
    }

    @Test
    @DisplayName("养护建议：isVaccinated 为 null 时不出现任何疫苗相关断言")
    void healthAdviceUser_shouldOmitVaccinationWhenNull() {
        PetHealthAdviceRequest req = fullRequest();
        req.setIsVaccinated(null);

        String text = AiPrompts.healthAdviceUser(req);

        // 关键：null 是"未填写"，既不能说"是"也不能说"否"。
        // 若这里冒出「否」，模型就会把没填过的宠物当成没接种疫苗来建议。
        assertFalse(text.contains("已接种疫苗"), text);
    }

    @Test
    @DisplayName("养护建议：isVaccinated=0 明确写成否")
    void healthAdviceUser_shouldSayNoWhenVaccinationIsZero() {
        PetHealthAdviceRequest req = fullRequest();
        req.setIsVaccinated(0);

        assertTrue(AiPrompts.healthAdviceUser(req).contains("已接种疫苗：否"));
    }

    @Test
    @DisplayName("养护建议：isNeutered 为脏数据时不猜，直接省略")
    void healthAdviceUser_shouldOmitNeuteredWhenValueIsJunk() {
        PetHealthAdviceRequest req = fullRequest();
        req.setIsNeutered(7);

        assertFalse(AiPrompts.healthAdviceUser(req).contains("已绝育"));
    }

    @Test
    @DisplayName("养护建议：请求体为 null 时给出兜底指令而不是 NPE")
    void healthAdviceUser_shouldNotThrowOnNullRequest() {
        // 直接调用即可：这里若抛 NPE，测试自然就红了
        String text = AiPrompts.healthAdviceUser(null);

        assertTrue(text.contains("通用"), text);
        assertFalse(text.contains("月龄"), text);
    }

    @Test
    @DisplayName("养护建议：什么有效信息都没有时给兜底指令且不许模型猜")
    void healthAdviceUser_shouldFallbackWhenNoUsefulInfo() {
        PetHealthAdviceRequest req = new PetHealthAdviceRequest();
        req.setName("小毛"); // 名字不算有效信息

        String text = AiPrompts.healthAdviceUser(req);

        assertTrue(text.contains("通用"), text);
        assertTrue(text.contains("不要猜测"), text);
        assertFalse(text.contains("名字：小毛"), text);
    }

    @Test
    @DisplayName("养护建议：种类归一化，中文「猫」「狗」与英文编码等价")
    void healthAdviceUser_shouldNormalizeSpecies() {
        PetHealthAdviceRequest cat = new PetHealthAdviceRequest();
        cat.setSpecies("cat");
        PetHealthAdviceRequest catZh = new PetHealthAdviceRequest();
        catZh.setSpecies("猫");
        PetHealthAdviceRequest dogZh = new PetHealthAdviceRequest();
        dogZh.setSpecies("狗");
        PetHealthAdviceRequest junk = new PetHealthAdviceRequest();
        junk.setSpecies("???");

        assertTrue(AiPrompts.healthAdviceUser(cat).contains("种类：猫咪"));
        assertTrue(AiPrompts.healthAdviceUser(catZh).contains("种类：猫咪"));
        assertTrue(AiPrompts.healthAdviceUser(dogZh).contains("种类：狗狗"));
        assertTrue(AiPrompts.healthAdviceUser(junk).contains("种类：其他"));
    }

    @Test
    @DisplayName("养护建议：用户可控的超长字段被截到 60 字")
    void healthAdviceUser_shouldClampLongFreeText() {
        PetHealthAdviceRequest req = fullRequest();
        req.setHealthStatus("猫".repeat(200));

        String text = AiPrompts.healthAdviceUser(req);

        assertTrue(text.contains("健康状况说明：" + "猫".repeat(60)), "应保留前 60 字");
        assertFalse(text.contains("猫".repeat(61)), "不应出现第 61 个字");
    }

    @Test
    @DisplayName("养护建议的 system 提示词必须包含安全边界关键词")
    void healthAdviceSystem_shouldKeepSafetyBoundaries() {
        String system = AiPrompts.PET_HEALTH_ADVICE_SYSTEM;

        // 这些词是产品红线，后人不该在调整文案时把它们删掉
        assertTrue(system.contains("不做诊断"), "missing 不做诊断");
        assertTrue(system.contains("不开药"), "missing 不开药");
        assertTrue(system.contains("剂量"), "missing 剂量");
        assertTrue(system.contains("兽医"), "missing 兽医");
        assertTrue(system.contains("宠物医院"), "missing 宠物医院");
        // 注入防护
        assertTrue(system.contains("忽略"), "missing 注入防护");
        // cleanPlainText 会把换行压成空格，多行输出会糊成一团
        assertTrue(system.contains("不要换行"), "missing 不要换行");
    }

    @Test
    @DisplayName("简介拼串回归：加了字段截断后原有行为不变")
    void petDescriptionUser_shouldKeepWorking() {
        PetDescriptionRequest req = new PetDescriptionRequest();
        req.setBreed("英国短毛猫");
        req.setAgeMonths(8);
        req.setGender(2);

        String text = AiPrompts.petDescriptionUser(req);

        assertTrue(text.contains("品种：英国短毛猫"), text);
        assertTrue(text.contains("月龄：8"), text);
        assertTrue(text.contains("性别：母"), text);

        assertTrue(AiPrompts.petDescriptionUser(null).contains("暂无更多信息"));
        assertTrue(AiPrompts.petDescriptionUser(new PetDescriptionRequest()).contains("暂无更多信息"));
    }

    @Test
    @DisplayName("简介拼串回归：超长自由文本同样被截到 60 字")
    void petDescriptionUser_shouldClampLongFreeText() {
        PetDescriptionRequest req = new PetDescriptionRequest();
        req.setKeywords("汪".repeat(200));

        String text = AiPrompts.petDescriptionUser(req);

        assertTrue(text.contains("关键词：" + "汪".repeat(60)));
        assertFalse(text.contains("汪".repeat(61)));
    }
}
