package com.petschool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petschool.entity.PetPending;
import org.apache.ibatis.annotations.Mapper;

/**
 * 待审核宠物信息 Mapper 接口
 */
@Mapper
public interface PetPendingMapper extends BaseMapper<PetPending> {
}
