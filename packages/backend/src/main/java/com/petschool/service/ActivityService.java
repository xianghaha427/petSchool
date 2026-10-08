package com.petschool.service;

import com.petschool.dto.ActivityCreateDTO;
import com.petschool.dto.ActivitySignupDTO;
import com.petschool.vo.ActivityVO;

import java.util.List;

/**
 * 校园活动服务接口
 */
public interface ActivityService {

    /**
     * 活动列表（仅 status=1 的），带实时报名人数。
     * 匿名可访问，signedUp 恒为 false。
     */
    List<ActivityVO> listActivities();

    /**
     * 当前用户报名过的活动，signedUp 恒为 true。
     * 首页用它得出「已报名」的按钮态。
     */
    List<ActivityVO> listMySignups(Long userId);

    /**
     * 创建活动（仅管理员）
     */
    void createActivity(ActivityCreateDTO dto, Long adminId);

    /**
     * 报名
     */
    void signup(Long activityId, Long userId, ActivitySignupDTO dto);

    /**
     * 取消报名
     */
    void cancelSignup(Long activityId, Long userId);
}
