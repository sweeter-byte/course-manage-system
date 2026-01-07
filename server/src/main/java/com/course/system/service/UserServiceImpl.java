package com.course.system.service;

import com.course.system.entity.User;
import com.course.system.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public boolean register(User user) {
        if (userMapper.selectByPhoneNumber(user.getPhoneNumber()) != null) {
            return false;
        }
        if (user.getUserId() == null) {
            user.setUserId(UUID.randomUUID().toString());
        }
        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userMapper.insert(user) > 0;
    }

    @Override
    public User login(String phoneNumber, String password) {
        User user = userMapper.selectByPhoneNumber(phoneNumber);
        // Use BCrypt matches() to compare passwords
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    @Override
    public User getUserById(String userId) {
        return userMapper.selectById(userId);
    }

    @Override
    public List<User> getAllUsers() {
        return userMapper.selectAll();
    }

    @Override
    public boolean updateUser(User user) {
        return userMapper.update(user) > 0;
    }

    @Override
    public boolean updatePassword(String userId, String oldPassword, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user != null && passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            return userMapper.updatePassword(userId, user.getPassword()) > 0;
        }
        return false;
    }

    @Override
    public boolean adminResetPassword(String userId, String newPassword) {
        User user = userMapper.selectById(userId);
        if (user != null) {
            String encodedPassword = passwordEncoder.encode(newPassword);
            return userMapper.updatePassword(userId, encodedPassword) > 0;
        }
        return false;
    }

    @Override
    public User loginBySms(String phoneNumber) {
        // For SMS login, just return the user if exists
        return userMapper.selectByPhoneNumber(phoneNumber);
    }

    @Override
    public User getUserByPhoneNumber(String phoneNumber) {
        return userMapper.selectByPhoneNumber(phoneNumber);
    }

    @Override
    public boolean resetPasswordByPhone(String phoneNumber, String newPassword) {
        User user = userMapper.selectByPhoneNumber(phoneNumber);
        if (user != null) {
            String encodedPassword = passwordEncoder.encode(newPassword);
            return userMapper.updatePassword(user.getUserId(), encodedPassword) > 0;
        }
        return false;
    }
}
