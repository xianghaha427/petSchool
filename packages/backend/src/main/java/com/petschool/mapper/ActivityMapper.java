package com.petschool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petschool.entity.Activity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 校园活动 Mapper 接口
 * <p>
 * 照 PetPendingMapper 的写法：空接口 + BaseMapper，不需要 XML。
 */
@Mapper
public interface ActivityMapper extends BaseMapper<Activity> {
}
