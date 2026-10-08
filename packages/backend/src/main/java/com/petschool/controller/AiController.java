package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.dto.ai.PetDescriptionRequest;
import com.petschool.dto.ai.PetHealthAdviceRequest;
import com.petschool.service.PetAiService;
import com.petschool.vo.PetHealthAdviceVO;
import com.petschool.vo.PetRecognitionVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * AI 能力 Controller
 * <p>
 * /ai/** 不在拦截器白名单里，因此天然需要 JWT 登录。
 */
@Tag(name = "AI 能力")
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final PetAiService petAiService;

    @Operation(summary = "宠物照片识别，返回结构化识别结果")
    @PostMapping(value = "/pet-recognize", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<PetRecognitionVO> recognizePet(
            @Parameter(description = "宠物照片") @RequestPart("image") MultipartFile image) {
        return Result.success(petAiService.recognizePet(image));
    }

    @Operation(summary = "根据已填信息生成宠物简介")
    @PostMapping("/pet-description")
    public Result<String> generateDescription(
            @RequestBody(required = false) PetDescriptionRequest request) {
        return Result.success(petAiService.generateDescription(request));
    }

    @Operation(summary = "根据宠物档案信息生成日常养护建议")
    @PostMapping("/pet-health-advice")
    public Result<PetHealthAdviceVO> generateHealthAdvice(
            @RequestBody(required = false) PetHealthAdviceRequest request) {
        return Result.success(petAiService.generateHealthAdvice(request));
    }
}
