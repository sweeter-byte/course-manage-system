package com.course.system.service;

import com.course.system.entity.SmsVerificationCode;
import com.course.system.mapper.SmsVerificationCodeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.Random;

@Service
public class SmsServiceImpl implements SmsService {

    @Autowired
    private SmsVerificationCodeMapper codeMapper;

    private static final int CODE_LENGTH = 6;
    private static final int EXPIRE_MINUTES = 5;

    @Override
    public boolean sendCode(String phoneNumber, String type) {
        // Generate 6-digit random code
        String code = generateCode();

        // Calculate expiration time (5 minutes from now)
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, EXPIRE_MINUTES);
        Date expiresAt = calendar.getTime();

        // Save to database
        SmsVerificationCode smsCode = new SmsVerificationCode();
        smsCode.setPhoneNumber(phoneNumber);
        smsCode.setCode(code);
        smsCode.setType(type);
        smsCode.setExpiresAt(expiresAt);
        smsCode.setUsed(false);

        int result = codeMapper.insert(smsCode);

        if (result > 0) {
            // Simulate sending SMS - print to console
            System.out.println("========================================");
            System.out.println("【短信验证码模拟发送】");
            System.out.println("手机号: " + phoneNumber);
            System.out.println("验证码: " + code);
            System.out.println("类型: " + type);
            System.out.println("有效期: " + EXPIRE_MINUTES + "分钟");
            System.out.println("========================================");
            return true;
        }
        return false;
    }

    @Override
    public boolean verifyCode(String phoneNumber, String code, String type) {
        SmsVerificationCode smsCode = codeMapper.findLatestValid(phoneNumber, type);

        if (smsCode != null && smsCode.getCode().equals(code)) {
            // Mark as used
            codeMapper.markAsUsed(smsCode.getId());
            return true;
        }
        return false;
    }

    private String generateCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
