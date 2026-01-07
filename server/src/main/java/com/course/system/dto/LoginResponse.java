package com.course.system.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Login response DTO - excludes password field for security
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String userId;
    private String username;
    private String realName;
    private String phoneNumber;
    private String email;
    private String role;
    private String studentId;
    private String teacherId;
    private String college;
    private String major;
    private String className;
    private String token;
}
