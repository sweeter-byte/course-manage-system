package com.course.system.entity;

import lombok.Data;
import java.util.Date;

@Data
public class SmsVerificationCode {
    private Long id;
    private String phoneNumber;
    private String code;
    private String type; // REGISTER, LOGIN, RESET_PASSWORD
    private Date createdAt;
    private Date expiresAt;
    private Boolean used;
}
