package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.common.constant.UserConstant;
import com.petschool.dto.PetDTO;
import com.petschool.dto.PetPageDTO;
import com.petschool.entity.Pet;
import com.petschool.interceptor.JwtTokenInterceptor;
import com.petschool.service.PetService;
import com.petschool.vo.PageVO;
import com.petschool.vo.PetVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 宠物管理 Controller
 */
@Tag(name = "宠物管理相关接口")
@RestController
@RequestMapping("/pets")
@Slf4j
public class PetController {

    @Autowired
    private PetService petService;

    /**
     * 检查是否有管理员权限
     */
    private boolean isAdmin(HttpServletRequest request) {
        Integer userRole = (Integer) request.getAttribute(JwtTokenInterceptor.USER_ROLE_KEY);
        return UserConstant.EMPLOYEE.equals(userRole);
    }

    // 分页查询宠物列表
    @Operation(summary = "分页查询宠物列表")
    @GetMapping
    public Result<PageVO<PetVO>> getPetList(PetPageDTO petPageDTO) {
        log.info("分页查询宠物列表");
        PageVO<PetVO> pageVO = petService.getPetList(petPageDTO);
        return Result.success(pageVO);
    }

    // 根据 ID 查询宠物
    @Operation(summary = "根据 ID 查询宠物详情")
    @GetMapping("/{id}")
    public Result<Pet> getPet(@Parameter(description = "宠物 ID") @PathVariable("id") Long petId) {
        log.info("根据 ID 查询宠物详情");
        Pet pet = petService.getbyId(petId);
        return Result.success(pet);
    }

    // 根据学号查询宠物
    @Operation(summary = "根据学号查询宠物")
    @GetMapping("/student/{studentId}")
    public Result<PetVO> getPetByStudentId(
            @Parameter(description = "学号") @PathVariable("studentId") String studentId) {
        log.info("根据学号查询宠物");
        PetVO petVO = petService.getPetByStudentId(studentId);
        return Result.success(petVO);
    }

    // 创建宠物
    @Operation(summary = "创建宠物登记")
    @PostMapping
    public Result createPet(@Valid @RequestBody PetDTO petDTO) {
        log.info("创建宠物登记");
        petService.createPet(petDTO);
        return Result.success();
    }

    // 更新宠物
    @Operation(summary = "更新宠物信息")
    @PutMapping("/{id}")
    public Result updatePet(
            @Parameter(description = "宠物 ID") @PathVariable("id") Long petId,
            @Valid @RequestBody PetDTO petDTO,
            HttpServletRequest request) {
        log.info("更新宠物信息");
        // 权限检查：只有管理员可以更新宠物
        if (!isAdmin(request)) {
            return Result.error(403, "无权限操作，仅管理员可更新宠物信息");
        }
        petService.updatePet(petId, petDTO);
        return Result.success();
    }

    // 删除宠物
    @Operation(summary = "删除宠物")
    @DeleteMapping("/{id}")
    public Result deletePet(
            @Parameter(description = "宠物 ID") @PathVariable("id") Long petId,
            HttpServletRequest request) {
        log.info("删除宠物");
        // 权限检查：只有管理员可以删除宠物
        if (!isAdmin(request)) {
            return Result.error(403, "无权限操作，仅管理员可删除宠物");
        }
        petService.deletePet(petId);
        return Result.success();
    }
}
