package com.course.system.sms;

import com.course.system.config.SmsConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

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
                logger.info("Using Tencent SMS Provider (Mock)");
                break;
            default:
                provider = new MockSmsProvider();
                logger.info("Using Mock SMS Provider");
        }
    }

    public SmsProvider getProvider() {
        return provider;
    }

    public String getProviderName() {
        return provider != null ? provider.getProviderName() : "None";
    }
}
