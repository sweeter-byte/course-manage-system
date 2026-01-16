package com.course.system.sms;

import com.course.system.config.SmsConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * SMS Provider Factory
 * 短信服务提供者工厂
 *
 * 根据配置自动选择短信服务提供商
 */
@Component
public class SmsProviderFactory {

    private static final Logger logger = LoggerFactory.getLogger(SmsProviderFactory.class);

    @Autowired
    private SmsConfig smsConfig;

    private SmsProvider provider;

    @PostConstruct
    public void init() {
        String providerName = smsConfig.getProvider().toLowerCase();

        switch (providerName) {
            case "aliyun":
                provider = new AliyunSmsProvider(smsConfig.getAliyun());
                logger.info("Using Aliyun SMS Provider");
                break;
            case "tencent":
                provider = new TencentSmsProvider(smsConfig.getTencent());
                logger.info("Using Tencent Cloud SMS Provider");
                break;
            case "mock":
            default:
                provider = new MockSmsProvider();
                logger.info("Using Mock SMS Provider (Development Mode)");
                logger.warn("==============================================");
                logger.warn("WARNING: SMS is in MOCK mode!");
                logger.warn("Verification codes will only be printed to console.");
                logger.warn("For production, set sms.provider=aliyun or sms.provider=tencent");
                logger.warn("==============================================");
                break;
        }
    }

    /**
     * 获取当前配置的短信服务提供者
     */
    public SmsProvider getProvider() {
        return provider;
    }

    /**
     * 获取当前提供者名称
     */
    public String getProviderName() {
        return provider != null ? provider.getProviderName() : "None";
    }
}
