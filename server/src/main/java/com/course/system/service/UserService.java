package com.course.system.service;

import com.course.system.entity.User;
import java.util.List;

public interface UserService {
    boolean register(User user);

    User login(String phoneNumber, String password);

    User loginBySms(String phoneNumber); // SMS login - returns user if phone exists

    User getUserById(String userId);

    User getUserByPhoneNumber(String phoneNumber);

    List<User> getAllUsers();

    boolean updateUser(User user);

    boolean updatePassword(String userId, String oldPassword, String newPassword);

    boolean adminResetPassword(String userId, String newPassword);

    boolean resetPasswordByPhone(String phoneNumber, String newPassword);
}
