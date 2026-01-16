package com.course.system.sms;

import com.course.system.config.SmsConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Tencent Cloud SMS Provider
 * 腾讯云短信服务实现
 *
 * 注意: 当前版本使用模拟模式，因为腾讯云SDK依赖已被注释。
 * 如需使用真实的腾讯云短信服务，请:
 * 1. 在 pom.xml 中取消注释腾讯云SDK依赖
 * 2. 将此文件替换为完整的SDK实现
 *
 * 使用前请完成以下步骤:
 * 1. 注册腾讯云账号: https://cloud.tencent.com
 * 2. 开通短信服务: https://cloud.tencent.com/product/sms
 * 3. 创建 SecretId/SecretKey: https://console.cloud.tencent.com/cam/capi
 * 4. 创建短信应用获取 SDK AppID: https://console.cloud.tencent.com/smsv2/app-manage
 * 5. 创建短信签名和模板: https://console.cloud.tencent.com/smsv2
 * 6. 在 application.properties 中配置相关参数
 */
public class TencentSmsProvider implements SmsProvider {

    private static final Logger logger = LoggerFactory.getLogger(TencentSmsProvider.class);

    private final SmsConfig.TencentConfig config;

    public TencentSmsProvider(SmsConfig.TencentConfig config) {
        this.config = config;
        logger.warn("Tencent Cloud SMS SDK is not available. Using mock mode.");
        logger.warn("To enable real Tencent SMS, uncomment the SDK dependency in pom.xml");
    }

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {
        // 模拟模式 - SDK未启用
        logger.info("[TENCENT-MOCK] Simulating SMS to {}: verification code is {}", phoneNumber, code);
        logger.info("[TENCENT-MOCK] To enable real SMS, add Tencent SDK dependency to pom.xml");

        // 返回true模拟发送成功
        return true;
    }

    @Override
    public String getProviderName() {
        return "Tencent Cloud (Mock Mode)";
    }
}
