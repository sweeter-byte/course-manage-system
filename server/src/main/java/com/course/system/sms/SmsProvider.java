package com.course.system.sms;

public interface SmsProvider {
    boolean sendVerificationCode(String phoneNumber, String code);
    String getProviderName();
}
