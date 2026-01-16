package com.course.system.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MockSmsProvider implements SmsProvider {

    private static final Logger logger = LoggerFactory.getLogger(MockSmsProvider.class);

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {
        System.out.println();
        System.out.println("========================================");
        System.out.println("【短信验证码 - 模拟发送】");
        System.out.println("手机号: " + phoneNumber);
        System.out.println("验证码: " + code);
        System.out.println("有效期: 5 分钟");
        System.out.println("========================================");
        System.out.println();
        logger.info("[MOCK SMS] Code {} sent to {}", code, phoneNumber);
        return true;
    }

    @Override
    public String getProviderName() {
        return "Mock (Development)";
    }
}
