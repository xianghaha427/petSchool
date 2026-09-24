package com.petschool.service.ai;

import com.petschool.dto.ai.PetDescriptionRequest;

import java.util.ArrayList;
import java.util.List;

/**
 * 提示词集中定义处
 */
public final class AiPrompts {

    private AiPrompts() {
    }

    /** 宠物识别：强约束只输出 JSON */
    public static final String PET_RECOGNITION_SYSTEM = """
            你是一个专业的宠物图像识别助手，负责为校园宠物登记系统识别照片中的宠物。
            请严格遵守以下输出要求：
            1. 只输出一个 JSON 对象，不要输出 markdown 代码块，不要输出任何解释、前后缀或多余文字。
            2. JSON 字段固定如下：
               - isPet：布尔值，画面中是否存在宠物
               - species：字符串，只能是 dog、cat、other 三者之一，不要使用中文或其它写法
               - breed：字符串，品种，无法判断时填空字符串
               - gender：整数，1 表示公，2 表示母，无法判断时填 null
               - color：字符串，毛色
               - ageMonths：整数，估算的月龄，无法判断时填 null
               - ageStage：字符串，只能是 幼年、成年、老年 三者之一
               - confidence：0 到 1 之间的小数，表示识别置信度
               - tips：一句简短的中文养护建议
            3. 如果画面中没有宠物，isPet 填 false，其余字段留空即可。
            """;

    /** 宠物识别：用户侧指令 */
    public static final String PET_RECOGNITION_USER =
            "请识别这张照片中的宠物，并严格按照要求的 JSON 格式返回结果。";

    /** 简介生成：强约束只输出正文 */
    public static final String PET_DESCRIPTION_SYSTEM = """
            你是一个校园宠物登记平台的文案助手，负责为宠物写一段用于展示的简介。
            请严格遵守以下输出要求：
            1. 只输出简介正文，不要标题，不要引号，不要换行，不要 emoji，不要 markdown 标记。
            2. 使用中文，语气温暖自然，长度 80 到 150 字。
            3. 只能依据用户给出的已知信息来描述，不要编造未提供的健康状况、血统、获奖经历等信息。
            """;

    /**
     * 把登记表单中已填写的信息拼成用户指令，空字段不出现
     */
    public static String petDescriptionUser(PetDescriptionRequest request) {
        if (request == null) {
            return "请根据以下信息写一段宠物简介：暂无更多信息。";
        }
        List<String> parts = new ArrayList<>();
        addIfPresent(parts, "名字", request.getName());
        addIfPresent(parts, "种类", request.getSpecies());
        addIfPresent(parts, "品种", request.getBreed());
        addIfPresent(parts, "毛色", request.getColor());
        if (request.getAgeMonths() != null) {
            parts.add("月龄：" + request.getAgeMonths());
        }
        if (request.getGender() != null) {
            parts.add("性别：" + (request.getGender() == 1 ? "公" : "母"));
        }
        addIfPresent(parts, "关键词", request.getKeywords());

        if (parts.isEmpty()) {
            return "请根据以下信息写一段宠物简介：暂无更多信息。";
        }
        return "请根据以下信息写一段宠物简介：" + String.join("；", parts) + "。";
    }

    private static void addIfPresent(List<String> parts, String label, String value) {
        if (value != null && !value.isBlank()) {
            parts.add(label + "：" + value.trim());
        }
    }
}
