package com.petschool.service;

import com.petschool.dto.ai.PetDescriptionRequest;
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
}
