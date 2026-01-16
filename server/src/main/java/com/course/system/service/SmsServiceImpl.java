package com.course.system.service;

import com.course.system.entity.SmsVerificationCode;
import com.course.system.mapper.SmsVerificationCodeMapper;
import com.course.system.sms.SmsProviderFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.Random;

/**
 * SMS Service Implementation
 * 短信服务实现类
 *
 * 支持多种短信服务商:
 * - mock: 模拟模式，仅控制台打印（开发测试用）
 * - aliyun: 阿里云短信服务
 * - tencent: 腾讯云短信服务
 *
 * 切换方式: 修改 application.properties 中的 sms.provider 配置
 */
@Service
public class SmsServiceImpl implements SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Autowired
    private SmsVerificationCodeMapper codeMapper;

    @Autowired
    private SmsProviderFactory smsProviderFactory;

    private static final int CODE_LENGTH = 6;
    private static final int EXPIRE_MINUTES = 5;

    @Override
    public boolean sendCode(String phoneNumber, String type) {
        // 验证手机号格式
        if (!isValidPhoneNumber(phoneNumber)) {
            logger.warn("Invalid phone number format: {}", phoneNumber);
            return false;
        }

        // 检查发送频率限制（1分钟内不能重复发送）
        if (isRateLimited(phoneNumber, type)) {
            logger.warn("SMS rate limited for phone: {}", phoneNumber);
            return false;
        }

        // 生成6位随机验证码
        String code = generateCode();

        // 计算过期时间（5分钟后）
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, EXPIRE_MINUTES);
        Date expiresAt = calendar.getTime();

        // 保存验证码到数据库
        SmsVerificationCode smsCode = new SmsVerificationCode();
        smsCode.setPhoneNumber(phoneNumber);
        smsCode.setCode(code);
        smsCode.setType(type);
        smsCode.setExpiresAt(expiresAt);
        smsCode.setUsed(false);

        int result = codeMapper.insert(smsCode);

        if (result > 0) {
            // 使用配置的短信服务商发送验证码
            boolean sent = smsProviderFactory.getProvider().sendVerificationCode(phoneNumber, code);

            if (sent) {
                logger.info("Verification code sent to {} via {}",
                        phoneNumber, smsProviderFactory.getProviderName());
                return true;
            } else {
                logger.error("Failed to send SMS to {}", phoneNumber);
                // 发送失败时删除数据库记录
                codeMapper.deleteById(smsCode.getId());
                return false;
            }
        }
        return false;
    }

    @Override
    public boolean verifyCode(String phoneNumber, String code, String type) {
        if (code == null || code.length() != CODE_LENGTH) {
            return false;
        }

        SmsVerificationCode smsCode = codeMapper.findLatestValid(phoneNumber, type);

        if (smsCode != null && smsCode.getCode().equals(code)) {
            // 标记为已使用
            codeMapper.markAsUsed(smsCode.getId());
            logger.info("Verification code verified successfully for {}", phoneNumber);
            return true;
        }

        logger.warn("Invalid verification code for {}", phoneNumber);
        return false;
    }

    /**
     * 生成6位数字验证码
     */
    private String generateCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    /**
     * 验证手机号格式（中国大陆手机号）
     */
    private boolean isValidPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return false;
        }
        // 简单验证：11位数字，以1开头
        return phoneNumber.matches("^1[3-9]\\d{9}$");
    }

    /**
     * 检查发送频率限制
     * 同一手机号同一类型，1分钟内只能发送一次
     */
    private boolean isRateLimited(String phoneNumber, String type) {
        SmsVerificationCode lastCode = codeMapper.findLatestByPhoneAndType(phoneNumber, type);
        if (lastCode != null && lastCode.getCreatedAt() != null) {
            long diff = System.currentTimeMillis() - lastCode.getCreatedAt().getTime();
            // 1分钟 = 60000毫秒
            return diff < 60000;
        }
        return false;
    }
}
