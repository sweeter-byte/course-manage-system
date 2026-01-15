package com.course.system.sms;

import com.course.system.config.SmsConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Tencent Cloud SMS Provider (Mock Mode)
 * 腾讯云SDK未包含在默认依赖中，当前为模拟模式
 */
public class TencentSmsProvider implements SmsProvider {

    private static final Logger logger = LoggerFactory.getLogger(TencentSmsProvider.class);

    public TencentSmsProvider(SmsConfig.TencentConfig config) {
        logger.warn("Tencent SMS running in MOCK mode (SDK not included)");
    }

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {
        System.out.println();
        System.out.println("========================================");
        System.out.println("【腾讯云短信 - 模拟发送】");
        System.out.println("手机号: " + phoneNumber);
        System.out.println("验证码: " + code);
        System.out.println("有效期: 5 分钟");
        System.out.println("(SDK未安装，如需真实发送请配置)");
        System.out.println("========================================");
        System.out.println();
        logger.info("[Tencent MOCK] Code {} sent to {}", code, phoneNumber);
        return true;
    }

    @Override
    public String getProviderName() {
        return "Tencent Cloud (Mock)";
    }
}
