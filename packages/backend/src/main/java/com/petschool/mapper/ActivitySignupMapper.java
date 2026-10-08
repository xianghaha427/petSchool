package com.petschool.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.petschool.entity.ActivitySignup;
import org.apache.ibatis.annotations.Mapper;

/**
 * 活动报名 Mapper 接口
 * <p>
 * 报名人数的统计走 {@code selectMaps} + GROUP BY（见 ActivityServiceImpl），
 * 一次查询拿到全部活动的报名数，不在循环里逐个 count。
 */
@Mapper
public interface ActivitySignupMapper extends BaseMapper<ActivitySignup> {
}
