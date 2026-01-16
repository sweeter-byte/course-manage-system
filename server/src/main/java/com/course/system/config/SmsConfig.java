package com.course.system.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * SMS Configuration Properties
 * 短信服务配置类
 *
 * 支持三种模式:
 * 1. mock - 模拟模式，仅在控制台打印验证码（开发测试用）
 * 2. aliyun - 阿里云短信服务
 * 3. tencent - 腾讯云短信服务
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "sms")
public class SmsConfig {

    /**
     * SMS Provider: aliyun, tencent, mock
     */
    private String provider = "mock";

    /**
     * Aliyun SMS Configuration
     */
    private AliyunConfig aliyun = new AliyunConfig();

    /**
     * Tencent Cloud SMS Configuration
     */
    private TencentConfig tencent = new TencentConfig();

    @Data
    public static class AliyunConfig {
        /**
         * 阿里云 AccessKey ID
         * 获取地址: https://ram.console.aliyun.com/manage/ak
         */
        private String accessKeyId;

        /**
         * 阿里云 AccessKey Secret
         */
        private String accessKeySecret;

        /**
         * 短信签名名称
         * 例如: "课程管理系统"
         */
        private String signName;

        /**
         * 短信模板Code
         * 例如: "SMS_123456789"
         * 模板内容示例: "您的验证码是${code}，5分钟内有效。"
         */
        private String templateCode;
    }

    @Data
    public static class TencentConfig {
        /**
         * 腾讯云 SecretId
         * 获取地址: https://console.cloud.tencent.com/cam/capi
         */
        private String secretId;

        /**
         * 腾讯云 SecretKey
         */
        private String secretKey;

        /**
         * 短信应用 SDK AppID
         * 获取地址: https://console.cloud.tencent.com/smsv2/app-manage
         */
        private String sdkAppId;

        /**
         * 短信签名内容
         * 例如: "课程管理系统"
         */
        private String signName;

        /**
         * 短信模板ID
         * 例如: "1234567"
         * 模板内容示例: "您的验证码是{1}，{2}分钟内有效。"
         */
        private String templateId;
    }
}
