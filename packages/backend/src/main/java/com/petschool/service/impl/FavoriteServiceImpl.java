package com.petschool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.petschool.common.constant.PetConstant;
import com.petschool.common.exception.BusinessException;
import com.petschool.entity.Favorite;
import com.petschool.entity.Pet;
import com.petschool.mapper.FavoriteMapper;
import com.petschool.mapper.PetMapper;
import com.petschool.service.FavoriteService;
import com.petschool.vo.PetVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 收藏服务实现类
 */
@Slf4j
@Service
public class FavoriteServiceImpl implements FavoriteService {

    @Autowired
    private FavoriteMapper favoriteMapper;

    @Autowired
    private PetMapper petMapper;

    @Override
    @Transactional
    public void addFavorite(Long userId, Long petId) {
        log.info("添加收藏, userId={}, petId={}", userId, petId);

        // 检查宠物是否存在
        Pet pet = petMapper.selectById(petId);
        if (pet == null || pet.getStatus() != PetConstant.ENABLE) {
            throw new BusinessException(404, "宠物不存在");
        }

        // 检查是否已收藏
        Favorite exist = favoriteMapper.selectByUserIdAndPetId(userId, petId);
        if (exist != null) {
            throw new BusinessException(400, "已经收藏过了");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setPetId(petId);
        favorite.setCreateTime(LocalDateTime.now());
        favoriteMapper.insert(favorite);
        log.info("添加收藏成功");
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long petId) {
        log.info("取消收藏, userId={}, petId={}", userId, petId);
        favoriteMapper.deleteByUserIdAndPetId(userId, petId);
        log.info("取消收藏成功");
    }

    @Override
    public List<PetVO> getUserFavorites(Long userId) {
        log.info("获取用户收藏列表, userId={}", userId);
        List<Favorite> favorites = favoriteMapper.selectByUserId(userId);
        List<Long> petIds = favorites.stream().map(Favorite::getPetId).collect(Collectors.toList());

        if (petIds.isEmpty()) {
            return List.of();
        }

        QueryWrapper<Pet> queryWrapper = new QueryWrapper<>();
        queryWrapper.in("id", petIds);
        queryWrapper.eq("status", PetConstant.ENABLE);
        List<Pet> pets = petMapper.selectList(queryWrapper);

        return pets.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Override
    public boolean isFavorited(Long userId, Long petId) {
        Favorite favorite = favoriteMapper.selectByUserIdAndPetId(userId, petId);
        return favorite != null;
    }

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

    private String getGenderLabel(Integer gender) {
        if (gender == null) return "未知";
        if (gender == PetConstant.MALE) return "公";
        if (gender == PetConstant.FEMALE) return "母";
        return "未知";
    }
}
