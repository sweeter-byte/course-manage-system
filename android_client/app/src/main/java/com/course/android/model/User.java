package com.course.android.model;

/**
 * 用户模型类 - 对应后端 LoginResponse DTO
 */
public class User {
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
    private String password; // 仅用于注册请求
    
    // Getters
    public String getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getRealName() { return realName; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getStudentId() { return studentId; }
    public String getTeacherId() { return teacherId; }
    public String getCollege() { return college; }
    public String getMajor() { return major; }
    public String getClassName() { return className; }
    public String getToken() { return token; }
    
    // Setters (用于注册)
    public void setUsername(String username) { this.username = username; }
    public void setPassword(String password) { this.password = password; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setRole(String role) { this.role = role; }
    public void setRealName(String realName) { this.realName = realName; }
}
