package com.petschool.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.petschool.common.constant.PetConstant;
import com.petschool.dto.PetDTO;
import com.petschool.dto.PetPageDTO;
import com.petschool.entity.Pet;
import com.petschool.mapper.PetMapper;
import com.petschool.service.PetService;
import com.petschool.vo.PageVO;
import com.petschool.vo.PetVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 宠物服务实现类
 */
@Slf4j
@Service
public class PetServiceImpl implements PetService {

    @Autowired
    private PetMapper petMapper;

    // 根据 ID 查询宠物
    @Override
    public Pet getbyId(Long petId) {
        log.info("根据 ID 查询宠物，petId={}", petId);
        Pet pet = petMapper.selectById(petId);
        return pet;
    }

    // 分页查询宠物列表
    @Override
    public PageVO<PetVO> getPetList(PetPageDTO petPageDTO) {
        log.info("分页查询宠物列表，请求参数：{}", petPageDTO);

        // 创建分页对象
        Page<Pet> page = new Page<>(petPageDTO.getPageNum(), petPageDTO.getPageSize());

        // 构建查询条件
        Map<String, Object> queryMap = new HashMap<>();
        if (petPageDTO.getStudentId() != null && !petPageDTO.getStudentId().isEmpty()) {
            queryMap.put("student_id", petPageDTO.getStudentId());
        }
        if (petPageDTO.getName() != null && !petPageDTO.getName().isEmpty()) {
            queryMap.put("name", petPageDTO.getName());
        }
        if (petPageDTO.getSpecies() != null && !petPageDTO.getSpecies().isEmpty()) {
            queryMap.put("species", petPageDTO.getSpecies());
        }

        // 执行分页查询
        IPage<Pet> petPage = petMapper.selectPageWithConditions(page, queryMap);

        // 转换为 PetVO 列表
        List<PetVO> petVOList = petPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        // 构建分页响应
        long pages = (long) Math.ceil((double) petPage.getTotal() / petPage.getSize());

        return PageVO.<PetVO>builder()
                .total(petPage.getTotal())
                .pages((int) pages)
                .pageNum(petPageDTO.getPageNum())
                .pageSize(petPageDTO.getPageSize())
                .list(petVOList)
                .build();
    }

    // 根据学号查询宠物
    @Override
    public PetVO getPetByStudentId(String studentId) {
        log.info("根据学号查询宠物，studentId={}", studentId);

        Map<String, Object> queryMap = new HashMap<>();
        queryMap.put("student_id", studentId);
        List<Pet> pets = petMapper.selectByMap(queryMap);

        if (pets == null || pets.isEmpty()) {
            return null;
        }

        return convertToVO(pets.get(0));
    }

    // 创建宠物
    @Override
    public void createPet(PetDTO petDTO) {
        log.info("创建宠物，请求参数：{}", petDTO);

        // 校验学号是否已存在
        Pet existPet = getbyStudentId(petDTO.getStudentId());
        if (existPet != null) {
            throw new RuntimeException("学号已存在");
        }

        // 创建宠物
        Pet pet = new Pet();
        BeanUtils.copyProperties(petDTO, pet);
        pet.setCreateTime(LocalDateTime.now());
        pet.setUpdateTime(LocalDateTime.now());
        pet.setStatus(PetConstant.ENABLE);

        petMapper.insert(pet);
        log.info("创建宠物成功，id={}", pet.getId());
    }

    // 更新宠物
    @Override
    public void updatePet(Long petId, PetDTO petDTO) {
        log.info("更新宠物，petId={}, 请求参数：{}", petId, petDTO);

        // 校验宠物是否存在
        Pet existPet = petMapper.selectById(petId);
        if (existPet == null) {
            throw new RuntimeException("宠物不存在");
        }

        // 更新宠物
        BeanUtils.copyProperties(petDTO, existPet);
        existPet.setUpdateTime(LocalDateTime.now());
        petMapper.updateById(existPet);
        log.info("更新宠物成功，petId={}", petId);
    }

    // 删除宠物
    @Override
    public void deletePet(Long petId) {
        log.info("删除宠物，petId={}", petId);

        // 校验宠物是否存在
        Pet existPet = petMapper.selectById(petId);
        if (existPet == null) {
            throw new RuntimeException("宠物不存在");
        }

        // 逻辑删除（设置状态为禁用）
        existPet.setStatus(PetConstant.DISABLE);
        petMapper.updateById(existPet);
        log.info("删除宠物成功，petId={}", petId);
    }

    /**
     * 转换为 PetVO
     */
    private PetVO convertToVO(Pet pet) {
        PetVO petVO = PetVO.builder()
                .id(pet.getId())
                .studentId(pet.getStudentId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .weight(pet.getWeight())
                .gender(pet.getGender())
                .genderLabel(getGenderLabel(pet.getGender()))
                .photoUrl(pet.getPhotoUrl())
                .description(pet.getDescription())
                .ownerName(pet.getOwnerName())
                .ownerContact(pet.getOwnerContact())
                .vaccinationDate(pet.getVaccinationDate())
                .isVaccinated(pet.getIsVaccinated())
                .isNeutered(pet.getIsNeutered())
                .healthStatus(pet.getHealthStatus())
                .status(pet.getStatus())
                .createTime(pet.getCreateTime())
                .updateTime(pet.getUpdateTime())
                .build();

        return petVO;
    }

    /**
     * 获取性别标签
     */
    private String getGenderLabel(Integer gender) {
        if (gender == null) {
            return "未知";
        }
        if (gender == PetConstant.MALE) {
            return "公";
        } else if (gender == PetConstant.FEMALE) {
            return "母";
        }
        return "未知";
    }

    /**
     * 根据学号查询宠物实体
     */
    private Pet getbyStudentId(String studentId) {
        Map<String, Object> queryMap = new HashMap<>();
        queryMap.put("student_id", studentId);
        List<Pet> pets = petMapper.selectByMap(queryMap);
        if (pets == null || pets.isEmpty()) {
            return null;
        }
        return pets.get(0);
    }
}
