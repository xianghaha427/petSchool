package com.petschool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petschool.entity.Favorite;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 收藏 Mapper 接口
 */
@Mapper
public interface FavoriteMapper extends BaseMapper<Favorite> {

    /**
     * 查询用户的收藏列表
     *//*
    List<Favorite> selectByUserId(@Param("userId") Long userId);

    *//**
     * 查询用户是否收藏了指定宠物
     *//*
    Favorite selectByUserIdAndPetId(@Param("userId") Long userId, @Param("petId") Long petId);

    *//**
     * 删除收藏
     *//*
    int deleteByUserIdAndPetId(@Param("userId") Long userId, @Param("petId") Long petId);*/
}
