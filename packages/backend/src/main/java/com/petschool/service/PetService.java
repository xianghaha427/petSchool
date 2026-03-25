package com.petschool.service;

import com.petschool.dto.PetDTO;
import com.petschool.dto.PetPageDTO;
import com.petschool.entity.Pet;
import com.petschool.vo.PageVO;
import com.petschool.vo.PetVO;

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
     * 分页查询宠物列表
     */
    PageVO<PetVO> getPetList(PetPageDTO petPageDTO);

    /**
     * 根据学号查询宠物
     */
    PetVO getPetByStudentId(String studentId);

    /**
     * 创建宠物
     */
    void createPet(PetDTO petDTO);

    /**
     * 更新宠物
     */
    void updatePet(Long petId, PetDTO petDTO);

    /**
     * 删除宠物
     */
    void deletePet(Long petId);
}
