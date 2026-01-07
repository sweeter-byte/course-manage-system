package com.course.system.entity;

import lombok.Data;
import java.util.Date;

@Data
public class User {
    private String userId;
    private String username;
    private String password;
    private String realName;
    private String phoneNumber;
    private String email;
    private String role; // student, teacher, officer
    private String studentId;
    private String teacherId;
    private String college;
    private String major;
    private String className;
    private Date registerTime;
}
