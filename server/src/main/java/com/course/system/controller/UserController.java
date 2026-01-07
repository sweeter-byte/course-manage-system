package com.course.system.controller;

import com.course.system.dto.LoginResponse;
import com.course.system.entity.User;
import com.course.system.security.JwtUtil;
import com.course.system.service.SmsService;
import com.course.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SmsService smsService;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, Object> registerData) {
        Map<String, Object> response = new HashMap<>();

        String phoneNumber = (String) registerData.get("phoneNumber");
        String code = (String) registerData.get("code");

        // Verify SMS code
        if (code == null || !smsService.verifyCode(phoneNumber, code, "REGISTER")) {
            response.put("code", 400);
            response.put("message", "验证码无效或已过期");
            return response;
        }

        User user = new User();
        user.setPhoneNumber(phoneNumber);
        user.setUsername((String) registerData.get("username"));
        user.setPassword((String) registerData.get("password"));
        user.setRole((String) registerData.get("role"));
        user.setRealName((String) registerData.get("realName"));
        user.setEmail((String) registerData.get("email"));

        boolean success = userService.register(user);
        if (success) {
            response.put("code", 200);
            response.put("message", "注册成功");
        } else {
            response.put("code", 400);
            response.put("message", "注册失败（手机号可能已被注册）");
        }
        return response;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        String phoneNumber = loginData.get("phoneNumber");
        String password = loginData.get("password");
        User user = userService.login(phoneNumber, password);
        Map<String, Object> response = new HashMap<>();
        if (user != null) {
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUserId(), user.getRole());

            // Build login response WITHOUT password
            LoginResponse loginResponse = LoginResponse.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .realName(user.getRealName())
                    .phoneNumber(user.getPhoneNumber())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .studentId(user.getStudentId())
                    .teacherId(user.getTeacherId())
                    .college(user.getCollege())
                    .major(user.getMajor())
                    .className(user.getClassName())
                    .token(token)
                    .build();

            response.put("code", 200);
            response.put("message", "Login successful");
            response.put("user", loginResponse);
        } else {
            response.put("code", 401);
            response.put("message", "Invalid credentials");
        }
        return response;
    }

    @PostMapping("/update")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or principal == #user.userId")
    public Map<String, Object> updateUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        boolean success = userService.updateUser(user);
        if (success) {
            response.put("code", 200);
            response.put("message", "User updated successfully");
        } else {
            response.put("code", 400);
            response.put("message", "Failed to update user");
        }
        return response;
    }

    @PostMapping("/update-password")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or principal == #passwordData['userId']")
    public Map<String, Object> updatePassword(@RequestBody Map<String, String> passwordData) {
        Map<String, Object> response = new HashMap<>();
        String userId = passwordData.get("userId");
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");

        boolean success = userService.updatePassword(userId, oldPassword, newPassword);
        if (success) {
            response.put("code", 200);
            response.put("message", "Password updated successfully");
        } else {
            response.put("code", 400);
            response.put("message", "Failed to update password (invalid old password)");
        }
        return response;
    }

    @PostMapping("/logout")
    public Map<String, Object> logout() {
        // For stateless JWT, logout is handled client-side by removing the token
        // Server-side logout could implement token blacklisting if needed
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "Logout successful");
        return response;
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or principal == #id")
    public Map<String, Object> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        Map<String, Object> response = new HashMap<>();
        if (user != null) {
            // Return user without password
            LoginResponse userResponse = LoginResponse.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .realName(user.getRealName())
                    .phoneNumber(user.getPhoneNumber())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .studentId(user.getStudentId())
                    .teacherId(user.getTeacherId())
                    .college(user.getCollege())
                    .major(user.getMajor())
                    .className(user.getClassName())
                    .build();
            response.put("code", 200);
            response.put("data", userResponse);
        } else {
            response.put("code", 404);
            response.put("message", "User not found");
        }
        return response;
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        java.util.List<LoginResponse> userList = new java.util.ArrayList<>();

        for (User user : userService.getAllUsers()) {
            LoginResponse userResponse = LoginResponse.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .realName(user.getRealName())
                    .phoneNumber(user.getPhoneNumber())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .studentId(user.getStudentId())
                    .teacherId(user.getTeacherId())
                    .college(user.getCollege())
                    .major(user.getMajor())
                    .className(user.getClassName())
                    .build();
            userList.add(userResponse);
        }

        response.put("code", 200);
        response.put("data", userList);
        return response;
    }

    @PostMapping("/admin-reset-password")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> adminResetPassword(@RequestBody Map<String, String> passwordData) {
        Map<String, Object> response = new HashMap<>();
        String userId = passwordData.get("userId");
        String newPassword = passwordData.get("newPassword");

        if (userId == null || newPassword == null) {
            response.put("code", 400);
            response.put("message", "Missing required fields: userId and newPassword");
            return response;
        }

        boolean success = userService.adminResetPassword(userId, newPassword);
        if (success) {
            response.put("code", 200);
            response.put("message", "Password reset successfully");
        } else {
            response.put("code", 400);
            response.put("message", "Failed to reset password");
        }
        return response;
    }

    @PostMapping("/login-sms")
    public Map<String, Object> loginBySms(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        String phoneNumber = loginData.get("phoneNumber");
        String code = loginData.get("code");

        // Verify SMS code
        if (code == null || !smsService.verifyCode(phoneNumber, code, "LOGIN")) {
            response.put("code", 401);
            response.put("message", "验证码无效或已过期");
            return response;
        }

        User user = userService.loginBySms(phoneNumber);
        if (user != null) {
            String token = jwtUtil.generateToken(user.getUserId(), user.getRole());

            LoginResponse loginResponse = LoginResponse.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .realName(user.getRealName())
                    .phoneNumber(user.getPhoneNumber())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .studentId(user.getStudentId())
                    .teacherId(user.getTeacherId())
                    .college(user.getCollege())
                    .major(user.getMajor())
                    .className(user.getClassName())
                    .token(token)
                    .build();

            response.put("code", 200);
            response.put("message", "登录成功");
            response.put("user", loginResponse);
        } else {
            response.put("code", 404);
            response.put("message", "该手机号未注册");
        }
        return response;
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> resetData) {
        Map<String, Object> response = new HashMap<>();
        String phoneNumber = resetData.get("phoneNumber");
        String code = resetData.get("code");
        String newPassword = resetData.get("newPassword");

        // Verify SMS code
        if (code == null || !smsService.verifyCode(phoneNumber, code, "RESET_PASSWORD")) {
            response.put("code", 400);
            response.put("message", "验证码无效或已过期");
            return response;
        }

        if (newPassword == null || newPassword.length() < 6) {
            response.put("code", 400);
            response.put("message", "新密码不能少于6位");
            return response;
        }

        boolean success = userService.resetPasswordByPhone(phoneNumber, newPassword);
        if (success) {
            response.put("code", 200);
            response.put("message", "密码重置成功");
        } else {
            response.put("code", 400);
            response.put("message", "密码重置失败，该手机号可能未注册");
        }
        return response;
    }
}
