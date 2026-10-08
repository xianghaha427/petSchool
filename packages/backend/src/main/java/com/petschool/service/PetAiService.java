package com.petschool.service;

import com.petschool.dto.ai.PetDescriptionRequest;
import com.petschool.dto.ai.PetHealthAdviceRequest;
import com.petschool.vo.PetHealthAdviceVO;
import com.petschool.vo.PetRecognitionVO;
import org.springframework.web.multipart.MultipartFile;

/**
 * 宠物 AI 能力编排服务
 */
public interface PetAiService {

    /**
     * 识别宠物照片，返回归一化后的结构化结果
     */
    PetRecognitionVO recognizePet(MultipartFile file);

    /**
     * 根据表单已填信息生成一段宠物简介
     */
    String generateDescription(PetDescriptionRequest request);

    /**
     * 根据宠物档案里已有的信息生成一段日常养护建议
     * <p>
     * 返回值里的 disclaimer 是后端固定文案，不由模型产生。
     */
    PetHealthAdviceVO generateHealthAdvice(PetHealthAdviceRequest request);
}
