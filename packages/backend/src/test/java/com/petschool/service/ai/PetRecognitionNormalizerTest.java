package com.petschool.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petschool.common.ResultCode;
import com.petschool.vo.PetRecognitionVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 识别结果归一化的纯单元测试
 * <p>
 * 注意：返回值是包装类型，断言统一使用 valueOf 包裹的期望值，避免断言重载歧义。
 */
class PetRecognitionNormalizerTest {

    private static final String MODEL = "qwen3-vl-flash";

    private final ObjectMapper mapper = new ObjectMapper();

    // ------------------------------------------------------------------
    // 物种
    // ------------------------------------------------------------------

    @ParameterizedTest
    @DisplayName("猫的各种别名都归一化成 cat")
    @ValueSource(strings = {"猫", "猫咪", "小猫", "cat", "CAT", "Cat", "kitten", "feline", "一只猫"})
    void normalizeSpecies_shouldMapCatAliases(String raw) {
        assertEquals(PetRecognitionNormalizer.SPECIES_CAT,
                PetRecognitionNormalizer.normalizeSpecies(raw));
    }

    @ParameterizedTest
    @DisplayName("狗的各种别名都归一化成 dog")
    @ValueSource(strings = {"狗", "犬", "小狗", "dog", "DOG", "puppy", "canine", "一只狗"})
    void normalizeSpecies_shouldMapDogAliases(String raw) {
        assertEquals(PetRecognitionNormalizer.SPECIES_DOG,
                PetRecognitionNormalizer.normalizeSpecies(raw));
    }

    @ParameterizedTest
    @DisplayName("其它物种与非法输入都归一化成 other")
    @ValueSource(strings = {"兔子", "仓鼠", "bird", "unknown", "  ", "其它"})
    void normalizeSpecies_shouldFallbackToOther(String raw) {
        assertEquals(PetRecognitionNormalizer.SPECIES_OTHER,
                PetRecognitionNormalizer.normalizeSpecies(raw));
    }

    @Test
    @DisplayName("物种为 null 时返回 other")
    void normalizeSpecies_shouldHandleNull() {
        assertEquals(PetRecognitionNormalizer.SPECIES_OTHER,
                PetRecognitionNormalizer.normalizeSpecies(null));
    }

    // ------------------------------------------------------------------
    // 性别
    // ------------------------------------------------------------------

    @ParameterizedTest
    @DisplayName("公性别别名归一化成 1")
    @ValueSource(strings = {"male", "MALE", "m", "1", "公", "雄性", "公猫"})
    void normalizeGender_shouldMapMale(String raw) {
        assertEquals(Integer.valueOf(1), PetRecognitionNormalizer.normalizeGender(raw));
    }

    @ParameterizedTest
    @DisplayName("母性别别名归一化成 2")
    @ValueSource(strings = {"female", "FEMALE", "f", "2", "母", "雌性", "母猫"})
    void normalizeGender_shouldMapFemale(String raw) {
        assertEquals(Integer.valueOf(2), PetRecognitionNormalizer.normalizeGender(raw));
    }

    @ParameterizedTest
    @DisplayName("无法判断的性别返回 null（不能让前端渲染出非法值）")
    @ValueSource(strings = {"未知", "unknown", "3", "0", "-1", "  ", "abc"})
    void normalizeGender_shouldReturnNullForUnknown(String raw) {
        assertNull(PetRecognitionNormalizer.normalizeGender(raw));
    }

    @Test
    @DisplayName("性别为 null 时返回 null")
    void normalizeGender_shouldHandleNull() {
        assertNull(PetRecognitionNormalizer.normalizeGender(null));
    }

    // ------------------------------------------------------------------
    // 月龄
    // ------------------------------------------------------------------

    @ParameterizedTest
    @DisplayName("数字字符串正常解析")
    @CsvSource({"0,0", "1,1", "8,8", "12,12", "5.6,6", "299,299"})
    void normalizeAgeMonths_shouldParseNumbers(String raw, int expected) {
        assertEquals(Integer.valueOf(expected), PetRecognitionNormalizer.normalizeAgeMonths(raw));
    }

    @ParameterizedTest
    @DisplayName("越界月龄被 clamp 到 [0,300]")
    @CsvSource({"-1,0", "-100,0", "300,300", "301,300", "9999,300"})
    void normalizeAgeMonths_shouldClamp(String raw, int expected) {
        assertEquals(Integer.valueOf(expected), PetRecognitionNormalizer.normalizeAgeMonths(raw));
    }

    @ParameterizedTest
    @DisplayName("非数字返回 null")
    @ValueSource(strings = {"", "  ", "abc", "几个月", "unknown"})
    void normalizeAgeMonths_shouldReturnNullForNonNumeric(String raw) {
        assertNull(PetRecognitionNormalizer.normalizeAgeMonths(raw));
    }

    @Test
    @DisplayName("年龄阶段按边界划分")
    void ageStage_shouldSplitByBoundary() {
        assertEquals(PetRecognitionNormalizer.STAGE_YOUNG, PetRecognitionNormalizer.ageStage(0));
        assertEquals(PetRecognitionNormalizer.STAGE_YOUNG, PetRecognitionNormalizer.ageStage(11));
        assertEquals(PetRecognitionNormalizer.STAGE_ADULT, PetRecognitionNormalizer.ageStage(12));
        assertEquals(PetRecognitionNormalizer.STAGE_ADULT, PetRecognitionNormalizer.ageStage(83));
        assertEquals(PetRecognitionNormalizer.STAGE_SENIOR, PetRecognitionNormalizer.ageStage(84));
        assertNull(PetRecognitionNormalizer.ageStage(null));
    }

    // ------------------------------------------------------------------
    // normalize
    // ------------------------------------------------------------------

    @Test
    @DisplayName("完整 JSON 全字段归一化")
    void normalize_shouldMapFullJson() throws Exception {
        String json = """
                {"isPet":true,"species":"猫咪","speciesLabel":"英短","breed":"英国短毛猫",
                 "gender":"母","color":"橘白","ageMonths":8,"ageStage":"幼年",
                 "confidence":0.93,"tips":"多喝水"}""";
        PetRecognitionVO vo = PetRecognitionNormalizer.normalize(mapper.readTree(json), MODEL);

        assertEquals(Boolean.TRUE, vo.getIsPet());
        assertEquals(PetRecognitionNormalizer.SPECIES_CAT, vo.getSpecies());
        assertEquals("英短", vo.getSpeciesLabel());
        assertEquals("英国短毛猫", vo.getBreed());
        assertEquals(Integer.valueOf(2), vo.getGender());
        assertEquals("母", vo.getGenderLabel());
        assertEquals("橘白", vo.getColor());
        assertEquals(Integer.valueOf(8), vo.getAgeMonths());
        assertEquals("幼年", vo.getAgeStage());
        assertEquals(Double.valueOf(0.93), vo.getConfidence());
        assertEquals("多喝水", vo.getTips());
        assertEquals(MODEL, vo.getModel());
        assertFalse(vo.getDegraded());
    }

    @Test
    @DisplayName("字段全部缺失时不抛 NPE，且物种兜底为 other")
    void normalize_shouldNotThrowOnEmptyObject() throws Exception {
        PetRecognitionVO vo = PetRecognitionNormalizer.normalize(mapper.readTree("{}"), MODEL);

        assertEquals(Boolean.TRUE, vo.getIsPet());
        assertEquals(PetRecognitionNormalizer.SPECIES_OTHER, vo.getSpecies());
        assertEquals("其他", vo.getSpeciesLabel());
        assertNull(vo.getBreed());
        assertNull(vo.getGender());
        assertNull(vo.getGenderLabel());
        assertNull(vo.getColor());
        assertNull(vo.getAgeMonths());
        assertNull(vo.getAgeStage());
        assertNull(vo.getConfidence());
        assertNull(vo.getTips());
        assertEquals(MODEL, vo.getModel());
    }

    @Test
    @DisplayName("JSON 显式 null 不会被写成字符串 null")
    void normalize_shouldTreatJsonNullAsNull() throws Exception {
        String json = "{\"isPet\":true,\"species\":null,\"breed\":null,\"gender\":null,"
                + "\"color\":null,\"ageMonths\":null,\"confidence\":null,\"tips\":null}";
        PetRecognitionVO vo = PetRecognitionNormalizer.normalize(mapper.readTree(json), MODEL);

        assertNull(vo.getBreed());
        assertNull(vo.getGender());
        assertNull(vo.getColor());
        assertNull(vo.getAgeMonths());
        assertNull(vo.getTips());
        assertEquals(PetRecognitionNormalizer.SPECIES_OTHER, vo.getSpecies());
    }

    @Test
    @DisplayName("字段类型不符时降级处理而不是抛异常")
    void normalize_shouldTolerateWrongTypes() throws Exception {
        String json = "{\"isPet\":\"是\",\"species\":\"cat\",\"gender\":\"female\","
                + "\"ageMonths\":\"8\",\"confidence\":\"95\",\"breed\":{\"a\":1}}";
        PetRecognitionVO vo = PetRecognitionNormalizer.normalize(mapper.readTree(json), MODEL);

        assertEquals(Boolean.TRUE, vo.getIsPet());
        assertEquals(Integer.valueOf(2), vo.getGender());
        assertEquals(Integer.valueOf(8), vo.getAgeMonths());
        // 百分数 95 被折算成 0.95
        assertEquals(Double.valueOf(0.95), vo.getConfidence());
        assertNull(vo.getBreed());
    }

    @Test
    @DisplayName("isPet 缺失时默认为 true，避免误伤 other 类宠物")
    void normalize_shouldDefaultIsPetToTrue() throws Exception {
        PetRecognitionVO vo = PetRecognitionNormalizer.normalize(
                mapper.readTree("{\"species\":\"兔子\"}"), MODEL);
        assertTrue(vo.getIsPet());
        assertEquals(PetRecognitionNormalizer.SPECIES_OTHER, vo.getSpecies());
    }

    @Test
    @DisplayName("JSON 为 null 时抛 1005")
    void normalize_shouldThrow1005OnNullJson() {
        AiException ex = assertThrows(AiException.class,
                () -> PetRecognitionNormalizer.normalize(null, MODEL));
        assertEquals(ResultCode.AI_RECOGNIZE_FAILED.getCode(), ex.getCode());
    }
}
