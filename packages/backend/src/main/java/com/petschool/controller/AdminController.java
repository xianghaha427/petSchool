package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.dto.PetDTO;
import com.petschool.entity.User;
import com.petschool.service.PetPendingService;
import com.petschool.service.PetService;
import com.petschool.utils.AdminChecker;
import com.petschool.vo.PetPendingVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 管理员控制器
 * <p>
 * /admin/** 不在 JwtTokenInterceptor 的放行名单里，所以这里天然需要 token；
 * 角色校验统一交给 {@link AdminChecker}。
 */
@Slf4j
@RestController
@RequestMapping("/admin/pets")
@Tag(name = "管理员宠物接口")
public class AdminController {

    @Autowired
    private PetPendingService petPendingService;

    @Autowired
    private PetService petService;

    @Autowired
    private AdminChecker adminChecker;

    // ===== 待审核登记 =====

    /**
     * 管理员查看所有待审核列表
     */
    @GetMapping("/pending")
    @Operation(summary = "查看所有待审核列表")
    public Result<List<PetPendingVO>> getAllPendingList(HttpServletRequest request) {
        adminChecker.check(request);

        List<PetPendingVO> list = petPendingService.getAllPendingList();
        return Result.success(list);
    }

    /**
     * 管理员通过审核
     */
    @PutMapping("/pending/{id}/approve")
    @Operation(summary = "通过审核")
    public Result<Void> approve(@PathVariable Long id, HttpServletRequest request) {
        adminChecker.check(request);

        petPendingService.approve(id);
        return Result.success();
    }

    /**
     * 管理员拒绝审核
     */
    @PutMapping("/pending/{id}/reject")
    @Operation(summary = "拒绝审核")
    public Result<Void> reject(@PathVariable Long id,
                               @RequestParam String rejectReason,
                               HttpServletRequest request) {
        adminChecker.check(request);

        petPendingService.reject(id, rejectReason);
        return Result.success();
    }

    // ===== 宠物写接口（原 PetController 中无校验的 /pets 写接口收归到这里）=====

    /**
     * 创建宠物
     */
    @PostMapping
    @Operation(summary = "创建宠物登记（管理员）")
    public Result<Void> createPet(HttpServletRequest request, @RequestBody PetDTO petDTO) {
        User admin = adminChecker.check(request);
        log.info("管理员创建宠物登记, userId: {}", admin.getId());

        petService.createPet(petDTO, admin.getId());
        return Result.success();
    }

    /**
     * 更新宠物
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新宠物信息（管理员）")
    public Result<Void> updatePet(
            @Parameter(description = "宠物 ID") @PathVariable("id") Long petId,
            @RequestBody PetDTO petDTO,
            HttpServletRequest request) {
        adminChecker.check(request);
        log.info("管理员更新宠物信息, petId: {}", petId);

        petService.updatePet(petId, petDTO);
        return Result.success();
    }

    /**
     * 删除宠物
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除宠物（管理员）")
    public Result<Void> deletePet(
            @Parameter(description = "宠物 ID") @PathVariable("id") Long petId,
            HttpServletRequest request) {
        adminChecker.check(request);
        log.info("管理员删除宠物, petId: {}", petId);

        petService.deletePet(petId);
        return Result.success();
    }
}
