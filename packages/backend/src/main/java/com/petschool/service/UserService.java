package com.petschool.service;

import com.petschool.dto.UserDTO;
import com.petschool.entity.User;

public interface UserService {
    User getbyId(Long userId);

    User login(UserDTO userDTO);

    void register(UserDTO userDTO);
}
