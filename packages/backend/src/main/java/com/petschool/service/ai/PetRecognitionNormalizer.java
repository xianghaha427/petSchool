package com.petschool.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.petschool.common.ResultCode;
import com.petschool.vo.PetRecognitionVO;

import java.util.Locale;

/**
 * 把大模型返回的、不可控的 JSON 归一化成前端可直接消费的 {@link PetRecognitionVO}。
 * <p>
 * 这里的原则是"宁可字段为 null，也不能抛 NPE"：
 * 任何字段缺失、类型不符或超出取值范围，都会被降级处理。
 */
public final class PetRecognitionNormalizer {

    public static final String SPECIES_DOG = "dog";
    public static final String SPECIES_CAT = "cat";
    public static final String SPECIES_OTHER = "other";

    public static final String STAGE_YOUNG = "幼年";
    public static final String STAGE_ADULT = "成年";
    public static final String STAGE_SENIOR = "老年";

    private static final int AGE_MONTHS_MAX = 300;

    private PetRecognitionNormalizer() {
    }

    /**
     * 归一化识别结果
     *
     * @param json  模型返回的 JSON，为 null 时抛出 1005
     * @param model 本次使用的模型名，原样带回给前端
     */
    public static PetRecognitionVO normalize(JsonNode json, String model) {
        if (json == null || !json.isObject()) {
            throw new AiException(ResultCode.AI_RECOGNIZE_FAILED.getCode(),
                    ResultCode.AI_RECOGNIZE_FAILED.getMessage());
        }

        String species = normalizeSpecies(firstText(json, "species", "petType", "type"));
        String speciesLabel = defaultIfBlank(firstText(json, "speciesLabel", "species_label"), speciesLabel(species));
        Integer gender = normalizeGender(firstText(json, "gender", "sex"));
        Integer ageMonths = normalizeAgeMonths(firstText(json, "ageMonths", "age_months", "age"));
        String ageStage = normalizeAgeStage(firstText(json, "ageStage", "age_stage"), ageMonths);
        Double confidence = normalizeConfidence(json, "confidence", "score");
        Boolean isPet = firstBool(json, "isPet", "is_pet");
        if (isPet == null) {
            // 模型没明确说"不是宠物"时，默认按"是"处理，避免误伤兔、仓鼠等 other 类宠物
            isPet = true;
        }

        return PetRecognitionVO.builder()
                .isPet(isPet)
                .species(species)
                .speciesLabel(speciesLabel)
                .breed(blankToNull(firstText(json, "breed", "variety")))
                .gender(gender)
                .genderLabel(genderLabel(gender))
                .color(blankToNull(firstText(json, "color", "colour")))
                .ageMonths(ageMonths)
                .ageStage(ageStage)
                .confidence(confidence)
                .tips(blankToNull(firstText(json, "tips", "tip", "advice")))
                .model(model)
                .degraded(false)
                .build();
    }

    /**
     * 物种归一化：只允许 dog / cat / other 三个值
     */
    public static String normalizeSpecies(String raw) {
        if (raw == null) {
            return SPECIES_OTHER;
        }
        String v = raw.trim().toLowerCase(Locale.ROOT);
        if (v.isEmpty()) {
            return SPECIES_OTHER;
        }
        if (v.contains("cat") || v.contains("kitten") || v.contains("feline")
                || v.contains("猫") || v.contains("喵")) {
            return SPECIES_CAT;
        }
        if (v.contains("dog") || v.contains("puppy") || v.contains("canine")
                || v.contains("狗") || v.contains("犬") || v.contains("汪")) {
            return SPECIES_DOG;
        }
        return SPECIES_OTHER;
    }

    /**
     * 性别归一化：1-公，2-母，无法判断返回 null
     */
    public static Integer normalizeGender(String raw) {
        if (raw == null) {
            return null;
        }
        String v = raw.trim().toLowerCase(Locale.ROOT);
        if (v.isEmpty()) {
            return null;
        }
        Double num = tryParseNumber(v);
        if (num != null) {
            int n = (int) Math.round(num);
            if (n == 1) {
                return 1;
            }
            if (n == 2) {
                return 2;
            }
            return null;
        }
        if (v.equals("male") || v.equals("m") || v.contains("公") || v.contains("雄") || v.contains("男")) {
            return 1;
        }
        if (v.equals("female") || v.equals("f") || v.contains("母") || v.contains("雌") || v.contains("女")) {
            return 2;
        }
        return null;
    }

    /**
     * 月龄归一化：接受数字或数字字符串，clamp 到 [0, 300]
     */
    public static Integer normalizeAgeMonths(String raw) {
        if (raw == null) {
            return null;
        }
        Double num = tryParseNumber(raw.trim());
        if (num == null) {
            return null;
        }
        long months = Math.round(num);
        if (months < 0) {
            return 0;
        }
        if (months > AGE_MONTHS_MAX) {
            return AGE_MONTHS_MAX;
        }
        return (int) months;
    }

    /**
     * 年龄阶段：幼年 / 成年 / 老年
     */
    public static String ageStage(Integer ageMonths) {
        if (ageMonths == null) {
            return null;
        }
        if (ageMonths < 12) {
            return STAGE_YOUNG;
        }
        if (ageMonths < 84) {
            return STAGE_ADULT;
        }
        return STAGE_SENIOR;
    }

    /**
     * 性别标签
     */
    public static String genderLabel(Integer gender) {
        if (gender == null) {
            return null;
        }
        return gender == 1 ? "公" : "母";
    }

    /**
     * 物种标签
     */
    public static String speciesLabel(String species) {
        if (SPECIES_DOG.equals(species)) {
            return "狗狗";
        }
        if (SPECIES_CAT.equals(species)) {
            return "猫咪";
        }
        return "其他";
    }

    // ------------------------------------------------------------------
    // 内部工具：所有取值都做空值与类型防御
    // ------------------------------------------------------------------

    private static String normalizeAgeStage(String raw, Integer ageMonths) {
        if (raw != null) {
            String v = raw.trim();
            if (v.contains("幼") || v.contains("baby") || v.contains("young") || v.contains("kitten") || v.contains("puppy")) {
                return STAGE_YOUNG;
            }
            if (v.contains("老") || v.contains("senior") || v.contains("elder")) {
                return STAGE_SENIOR;
            }
            if (v.contains("成年") || v.contains("成") || v.contains("adult")) {
                return STAGE_ADULT;
            }
        }
        return ageStage(ageMonths);
    }

    private static Double normalizeConfidence(JsonNode json, String... keys) {
        Double value = firstNumber(json, keys);
        if (value == null) {
            return null;
        }
        // 兼容供应商直接给百分数（例如 95 表示 95%）
        if (value > 1.0 && value <= 100.0) {
            value = value / 100.0;
        }
        if (value < 0.0) {
            return 0.0;
        }
        if (value > 1.0) {
            return 1.0;
        }
        return value;
    }

    private static String firstText(JsonNode json, String... keys) {
        for (String key : keys) {
            String value = text(json, key);
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private static String text(JsonNode json, String key) {
        if (json == null) {
            return null;
        }
        JsonNode node = json.get(key);
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        if (!node.isValueNode()) {
            return null;
        }
        String s = node.asText();
        if (s == null) {
            return null;
        }
        s = s.trim();
        return s.isEmpty() ? null : s;
    }

    private static Boolean firstBool(JsonNode json, String... keys) {
        for (String key : keys) {
            if (json == null) {
                return null;
            }
            JsonNode node = json.get(key);
            if (node == null || node.isNull() || node.isMissingNode()) {
                continue;
            }
            if (node.isBoolean()) {
                return node.asBoolean();
            }
            if (node.isTextual()) {
                String v = node.asText().trim().toLowerCase(Locale.ROOT);
                if (v.equals("true") || v.equals("yes") || v.equals("1") || v.equals("是")) {
                    return Boolean.TRUE;
                }
                if (v.equals("false") || v.equals("no") || v.equals("0") || v.equals("否")) {
                    return Boolean.FALSE;
                }
            }
        }
        return null;
    }

    private static Double firstNumber(JsonNode json, String... keys) {
        for (String key : keys) {
            if (json == null) {
                return null;
            }
            JsonNode node = json.get(key);
            if (node == null || node.isNull() || node.isMissingNode()) {
                continue;
            }
            if (node.isNumber()) {
                return node.asDouble();
            }
            if (node.isTextual()) {
                Double parsed = tryParseNumber(node.asText());
                if (parsed != null) {
                    return parsed;
                }
            }
        }
        return null;
    }

    private static Double tryParseNumber(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Double.valueOf(raw.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }

    private static String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
