package com.course.system.service;

public interface SmsService {
    /**
     * Send verification code to phone number
     * 
     * @param phoneNumber target phone number
     * @param type        code type: REGISTER, LOGIN, RESET_PASSWORD
     * @return true if sent successfully
     */
    boolean sendCode(String phoneNumber, String type);

    /**
     * Verify the code
     * 
     * @param phoneNumber phone number
     * @param code        verification code
     * @param type        code type
     * @return true if code is valid
     */
    boolean verifyCode(String phoneNumber, String code, String type);
}
