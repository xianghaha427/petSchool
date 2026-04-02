package com.petschool.service;

import com.petschool.entity.Favorite;
import com.petschool.vo.PetVO;

import java.util.List;

/**
 * 收藏服务接口
 */
public interface FavoriteService {

    /**
     * 添加收藏
     */
    void addFavorite(Long userId, Long petId);

    /**
     * 取消收藏
     */
    void removeFavorite(Long userId, Long petId);

    /**
     * 获取用户收藏列表
     */
    List<PetVO> getUserFavorites(Long userId);

    /**
     * 检查用户是否收藏了指定宠物
     */
    boolean isFavorited(Long userId, Long petId);
}
