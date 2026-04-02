package com.petschool.service;

import com.petschool.dto.PasswordChangeDTO;
import com.petschool.dto.UserDTO;
import com.petschool.dto.UserProfileUpdateDTO;
import com.petschool.entity.User;

public interface UserService {
    User getbyId(Long userId);

    User login(UserDTO userDTO);

    void register(UserDTO userDTO);

    /**
     * 更新用户资料
     */
    void updateProfile(Long userId, UserProfileUpdateDTO profileDTO);

    /**
     * 修改密码
     */
    void changePassword(Long userId, PasswordChangeDTO passwordDTO);
}
