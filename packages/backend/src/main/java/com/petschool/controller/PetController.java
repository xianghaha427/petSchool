package com.petschool.controller;

import com.petschool.common.Result;
import com.petschool.dto.PetPageDTO;
import com.petschool.entity.Pet;
import com.petschool.service.FavoriteService;
import com.petschool.service.PetService;
import com.petschool.vo.PageVO;
import com.petschool.vo.PetVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

    @Autowired
    private FavoriteService favoriteService;

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

    // 写接口（创建 / 更新 / 删除）已收归 AdminController 的 /admin/pets，
    // 因为 /pets 在拦截器里是放行的，留在这里等于任何人不带 token 就能写库。
}
