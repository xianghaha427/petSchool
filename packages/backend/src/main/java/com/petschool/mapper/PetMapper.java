package com.petschool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.petschool.entity.Pet;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

/**
 * 宠物信息 Mapper 接口
 */
@Mapper
public interface PetMapper extends BaseMapper<Pet> {

    /**
     * 分页查询宠物列表（带条件）
     */
    IPage<Pet> selectPageWithConditions(Page<Pet> page,
                                        @Param("queryMap") Map<String, Object> queryMap);

    /**
     * 根据学号查询宠物
     */
    Pet selectByStudentId(@Param("studentId") String studentId);

    /**
     * 根据 ID 查询宠物详情
     */
    Pet selectPetDetail(@Param("id") Long id);
}
