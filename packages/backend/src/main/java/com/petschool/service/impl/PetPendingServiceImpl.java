package com.petschool.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.petschool.common.constant.PetConstant;
import com.petschool.common.exception.BusinessException;
import com.petschool.dto.PetDTO;
import com.petschool.dto.PetPendingDTO;
import com.petschool.entity.Pet;
import com.petschool.entity.PetPending;
import com.petschool.entity.User;
import com.petschool.mapper.PetMapper;
import com.petschool.mapper.PetPendingMapper;
import com.petschool.mapper.UserMapper;
import com.petschool.service.PetPendingService;
import com.petschool.utils.StudentIdGenerator;
import com.petschool.vo.PetPendingVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 待审核宠物服务实现类
 */
@Slf4j
@Service
public class PetPendingServiceImpl implements PetPendingService {

    @Autowired
    private PetPendingMapper petPendingMapper;

    @Autowired
    private PetMapper petMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private StudentIdGenerator studentIdGenerator;

    @Override
    public void submitPending(PetPendingDTO petPendingDTO, Long userId) {
        log.info("用户提交待审核登记，userId={}，请求参数：{}", userId, petPendingDTO);

        // 创建待审核记录
        PetPending petPending = new PetPending();
        BeanUtils.copyProperties(petPendingDTO, petPending);
        petPending.setUserId(userId);
        petPending.setStatus(PetConstant.PENDING_STATUS);
        petPending.setCreateTime(LocalDateTime.now());
        petPending.setUpdateTime(LocalDateTime.now());

        petPendingMapper.insert(petPending);
        log.info("提交待审核登记成功，id={}", petPending.getId());
    }

    @Override
    public List<PetPendingVO> getMyPendingList(Long userId) {
        log.info("查询用户的待审核列表，userId={}", userId);

        QueryWrapper<PetPending> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId);
        queryWrapper.orderByDesc("create_time");
        List<PetPending> pendingList = petPendingMapper.selectList(queryWrapper);

        return pendingList.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PetPendingVO> getAllPendingList() {
        log.info("查询所有待审核列表");

        QueryWrapper<PetPending> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("create_time");
        List<PetPending> pendingList = petPendingMapper.selectList(queryWrapper);

        return pendingList.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void approve(Long pendingId) {
        log.info("管理员通过审核，pendingId={}", pendingId);

        // 查询待审核记录
        PetPending pending = petPendingMapper.selectById(pendingId);
        if (pending == null) {
            throw new BusinessException(404, "待审核记录不存在");
        }
        if (!PetConstant.PENDING_STATUS.equals(pending.getStatus())) {
            throw new BusinessException(400, "该记录已审核");
        }

        // 生成学号
        String studentId = studentIdGenerator.generateStudentId();

        // 转换为正式宠物记录
        Pet pet = new Pet();
        BeanUtils.copyProperties(pending, pet);
        pet.setStudentId(studentId);
        pet.setStatus(PetConstant.ENABLE);
        pet.setCreateTime(LocalDateTime.now());
        pet.setUpdateTime(LocalDateTime.now());

        // 保存到 pet 表
        petMapper.insert(pet);
        log.info("宠物登记已通过审核，生成学号={}，petId={}", studentId, pet.getId());

        // 删除待审核记录
        petPendingMapper.deleteById(pendingId);
        log.info("删除待审核记录，pendingId={}", pendingId);
    }

    @Override
    public void reject(Long pendingId, String rejectReason) {
        log.info("管理员拒绝审核，pendingId={}，拒绝原因={}", pendingId, rejectReason);

        // 查询待审核记录
        PetPending pending = petPendingMapper.selectById(pendingId);
        if (pending == null) {
            throw new BusinessException(404, "待审核记录不存在");
        }
        if (!PetConstant.PENDING_STATUS.equals(pending.getStatus())) {
            throw new BusinessException(400, "该记录已审核");
        }

        // 更新状态为已拒绝
        pending.setStatus(PetConstant.REJECTED_STATUS);
        pending.setRejectReason(rejectReason);
        pending.setUpdateTime(LocalDateTime.now());

        petPendingMapper.updateById(pending);
        log.info("拒绝审核成功，pendingId={}", pendingId);
    }

    /**
     * 转换为 PetPendingVO
     */
    private PetPendingVO convertToVO(PetPending pending) {
        // 获取用户名
        String username = "";
        User user = userMapper.selectById(pending.getUserId());
        if (user != null) {
            username = user.getUserName();
        }

        PetPendingVO vo = PetPendingVO.builder()
                .id(pending.getId())
                .userId(pending.getUserId())
                .username(username)
                .name(pending.getName())
                .species(pending.getSpecies())
                .breed(pending.getBreed())
                .age(pending.getAge())
                .weight(pending.getWeight())
                .gender(pending.getGender())
                .genderLabel(getGenderLabel(pending.getGender()))
                .photoUrl(pending.getPhotoUrl())
                .description(pending.getDescription())
                .ownerName(pending.getOwnerName())
                .ownerContact(pending.getOwnerContact())
                .vaccinationDate(pending.getVaccinationDate())
                .isVaccinated(pending.getIsVaccinated())
                .isNeutered(pending.getIsNeutered())
                .healthStatus(pending.getHealthStatus())
                .status(pending.getStatus())
                .statusLabel(getStatusLabel(pending.getStatus()))
                .rejectReason(pending.getRejectReason())
                .createTime(pending.getCreateTime())
                .updateTime(pending.getUpdateTime())
                .build();

        return vo;
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
     * 获取状态标签
     */
    private String getStatusLabel(Integer status) {
        if (status == null) {
            return "未知";
        }
        if (status == PetConstant.PENDING_STATUS) {
            return "待审核";
        } else if (status == PetConstant.APPROVED_STATUS) {
            return "已通过";
        } else if (status == PetConstant.REJECTED_STATUS) {
            return "已拒绝";
        }
        return "未知";
    }
}
