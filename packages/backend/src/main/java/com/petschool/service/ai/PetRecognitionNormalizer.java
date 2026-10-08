package com.petschool.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.petschool.common.ResultCode;
import com.petschool.vo.PetRecognitionVO;

import java.util.Locale;
import java.util.Set;

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

    /** 英文统称，模型偶尔会直接甩英文 */
    private static final Set<String> GENERIC_BREEDS_EN = Set.of(
            "cat", "cats", "kitten", "kitty", "dog", "dogs", "puppy", "doggy",
            "feline", "canine", "pet", "animal", "unknown", "other", "none", "n/a", "na");

    /** 中文统称整词 */
    private static final Set<String> GENERIC_BREEDS_ZH = Set.of(
            "猫", "狗", "猫咪", "狗狗", "小猫", "小狗", "幼猫", "幼犬", "猫猫", "狗子",
            "宠物", "小动物", "动物", "其他", "其它", "未知", "不详", "不确定",
            "无法判断", "无法辨认", "判断不出", "看不出", "混合", "串串");

    /**
     * 统称用字。判定方式：把品种里的「小/大/老/的」和空白去掉后，
     * 如果剩下的字**全部**落在这个集合里，说明它是个统称而非具体品种。
     * <p>
     * 不能用"包含猫/狗/犬"来判——布偶猫、腊肠犬、中华田园猫、马尔济斯犬
     * 都是正经品种，那样会误杀。而"小猫狗"这种真实出现过的垃圾值，
     * 去掉「小」后剩下的每个字都在集合里，就能被准确识别出来。
     */
    private static final String GENERIC_BREED_CHARS = "猫狗犬咪喵汪宠物只子动物";

    /** 推测前缀：模型没按要求改用 breedApprox 时，从这里剥掉 */
    private static final String[] APPROX_PREFIXES = {
            "可能是", "可能为", "可能", "应该是", "应该", "疑似", "大概是", "大概", "大约", "貌似", "像是"};

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
        String rawBreed = firstText(json, "breed", "variety");
        // 模型写成「可能是布偶猫」时，前缀要剥掉，但"这是推测"这个信息不能丢，
        // 所以记下来并入 breedApprox —— breed 本身必须保持干净，它会直接回填进表单并落库。
        boolean approxFromPrefix = hasApproxPrefix(rawBreed);
        String breed = normalizeBreed(rawBreed);
        boolean breedApprox = breed != null
                && (approxFromPrefix || Boolean.TRUE.equals(firstBool(json, "breedApprox", "breed_approx", "breedUncertain")));
        Boolean isPet = firstBool(json, "isPet", "is_pet");
        if (isPet == null) {
            // 模型没明确说"不是宠物"时，默认按"是"处理，避免误伤兔、仓鼠等 other 类宠物
            isPet = true;
        }

        return PetRecognitionVO.builder()
                .isPet(isPet)
                .species(species)
                .speciesLabel(speciesLabel)
                .breed(breed)
                .breedApprox(breedApprox)
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
     * 品种归一化。返回 null 表示"没有拿到可用的具体品种"。
     * <p>
     * 除了空值，还要挡掉模型给统称的情况——真实数据里出现过「小猫狗」这种值，
     * 直接展示出去就是用户看到的那句"我要的是具体的品种，而不是统称的猫咪"。
     * 剥掉「可能是」前缀后如果为空或属于统称，一律返回 null，
     * 让前端走"没识别出品种"的分支，而不是显示一个没意义的值。
     */
    public static String normalizeBreed(String raw) {
        if (raw == null) {
            return null;
        }
        String v = stripApproxPrefix(raw.trim());
        if (v.isEmpty() || isGenericBreed(v)) {
            return null;
        }
        return v;
    }

    /**
     * 判断一个品种值是不是"统称"（猫/狗/猫咪/小猫狗/unknown…），是则不可用
     */
    public static boolean isGenericBreed(String breed) {
        if (breed == null || breed.isBlank()) {
            return true;
        }
        String v = breed.trim().toLowerCase(Locale.ROOT);
        if (GENERIC_BREEDS_EN.contains(v) || GENERIC_BREEDS_ZH.contains(v)) {
            return true;
        }
        // 去掉修饰字后，若剩下的每个字都是"统称用字"，那它就是个统称
        String stripped = v.replace("小", "").replace("大", "").replace("老", "")
                .replace("的", "").replace(" ", "").replace("　", "");
        if (stripped.isEmpty()) {
            return true;
        }
        for (int i = 0; i < stripped.length(); i++) {
            if (GENERIC_BREED_CHARS.indexOf(stripped.charAt(i)) < 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * 品种值是否带了「可能是」这类推测前缀
     */
    public static boolean hasApproxPrefix(String raw) {
        return raw != null && !stripApproxPrefix(raw.trim()).equals(raw.trim());
    }

    private static String stripApproxPrefix(String value) {
        String v = value;
        // APPROX_PREFIXES 已按长到短排列，避免「可能是」被「可能」先吃掉而留下一个「是」
        for (String prefix : APPROX_PREFIXES) {
            if (v.startsWith(prefix)) {
                return v.substring(prefix.length()).trim();
            }
        }
        return v;
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
