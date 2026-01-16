package com.course.system.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * SMS Configuration Properties
 * 短信服务配置类
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "sms")
public class SmsConfig {

    private String provider = "mock";
    private AliyunConfig aliyun = new AliyunConfig();
    private TencentConfig tencent = new TencentConfig();

    @Data
    public static class AliyunConfig {
        private String accessKeyId;
        private String accessKeySecret;
        private String signName;
        private String templateCode;
    }

    @Data
    public static class TencentConfig {
        private String secretId;
        private String secretKey;
        private String sdkAppId;
        private String signName;
        private String templateId;
    }
}
