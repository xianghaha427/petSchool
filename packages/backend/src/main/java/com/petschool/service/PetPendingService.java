package com.petschool.service;

import com.petschool.dto.PetPendingDTO;
import com.petschool.vo.PetPendingVO;

import java.util.List;

/**
 * 待审核宠物服务接口
 */
public interface PetPendingService {

    /**
     * 用户提交待审核登记
     *
     * @param petPendingDTO 宠物待审核信息
     * @param userId       用户ID
     */
    void submitPending(PetPendingDTO petPendingDTO, Long userId);

    /**
     * 用户查看自己的待审核列表
     *
     * @param userId 用户ID
     * @return 待审核列表
     */
    List<PetPendingVO> getMyPendingList(Long userId);

    /**
     * 管理员查看所有待审核列表
     *
     * @return 所有待审核列表
     */
    List<PetPendingVO> getAllPendingList();

    /**
     * 管理员通过审核
     *
     * @param pendingId 待审核记录ID
     */
    void approve(Long pendingId);

    /**
     * 管理员拒绝审核
     *
     * @param pendingId    待审核记录ID
     * @param rejectReason 拒绝原因
     */
    void reject(Long pendingId, String rejectReason);
}
