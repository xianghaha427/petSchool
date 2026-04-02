package com.petschool.service;

import com.petschool.dto.PetDTO;
import com.petschool.dto.PetPageDTO;
import com.petschool.entity.Pet;
import com.petschool.vo.PageVO;
import com.petschool.vo.PetVO;

import java.util.List;
import java.util.Map;

/**
 * 宠物服务接口
 */
public interface PetService {

    /**
     * 根据 ID 查询宠物
     */
    Pet getbyId(Long petId);

    /**
     * 分页查询宠物列表（带搜索筛选）
     */
    PageVO<PetVO> getPetList(PetPageDTO petPageDTO);

    /**
     * 根据学号查询宠物
     */
    PetVO getPetByStudentId(String studentId);

    /**
     * 创建宠物
     */
    void createPet(PetDTO petDTO, Long userId);

    /**
     * 更新宠物
     */
    void updatePet(Long petId, PetDTO petDTO);

    /**
     * 删除宠物
     */
    void deletePet(Long petId);

    /**
     * 查询用户自己的宠物列表
     */
    List<PetVO> getMyPets(Long userId);

    /**
     * 更新用户自己的宠物
     */
    void updateMyPet(Long petId, Long userId, PetDTO petDTO);

    /**
     * 删除用户自己的宠物
     */
    void deleteMyPet(Long petId, Long userId);
}
