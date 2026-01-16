package com.course.system.sms;

import com.course.system.config.SmsConfig;
import com.tencentcloudapi.common.Credential;
import com.tencentcloudapi.common.exception.TencentCloudSDKException;
import com.tencentcloudapi.common.profile.ClientProfile;
import com.tencentcloudapi.common.profile.HttpProfile;
import com.tencentcloudapi.sms.v20210111.SmsClient;
import com.tencentcloudapi.sms.v20210111.models.SendSmsRequest;
import com.tencentcloudapi.sms.v20210111.models.SendSmsResponse;
import com.tencentcloudapi.sms.v20210111.models.SendStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Tencent Cloud SMS Provider
 * 腾讯云短信服务实现
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
    private SmsClient client;

    public TencentSmsProvider(SmsConfig.TencentConfig config) {
        this.config = config;
        initClient();
    }

    private void initClient() {
        try {
            Credential cred = new Credential(config.getSecretId(), config.getSecretKey());

            HttpProfile httpProfile = new HttpProfile();
            httpProfile.setEndpoint("sms.tencentcloudapi.com");

            ClientProfile clientProfile = new ClientProfile();
            clientProfile.setHttpProfile(httpProfile);

            // 使用广州地域，也可以根据需要修改
            this.client = new SmsClient(cred, "ap-guangzhou", clientProfile);
            logger.info("Tencent Cloud SMS client initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Tencent Cloud SMS client", e);
        }
    }

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {
        if (client == null) {
            logger.error("Tencent Cloud SMS client not initialized");
            return false;
        }

        try {
            SendSmsRequest request = new SendSmsRequest();

            // 短信应用ID
            request.setSmsSdkAppId(config.getSdkAppId());

            // 短信签名内容
            request.setSignName(config.getSignName());

            // 模板ID
            request.setTemplateId(config.getTemplateId());

            // 模板参数: 验证码和有效期(分钟)
            String[] templateParams = {code, "5"};
            request.setTemplateParamSet(templateParams);

            // 手机号码(国内号码格式: +86手机号)
            String[] phoneNumbers = {"+86" + phoneNumber};
            request.setPhoneNumberSet(phoneNumbers);

            SendSmsResponse response = client.SendSms(request);

            // 检查发送结果
            SendStatus[] sendStatusSet = response.getSendStatusSet();
            if (sendStatusSet != null && sendStatusSet.length > 0) {
                SendStatus status = sendStatusSet[0];
                if ("Ok".equals(status.getCode())) {
                    logger.info("SMS sent successfully to {} via Tencent Cloud", phoneNumber);
                    return true;
                } else {
                    logger.error("Failed to send SMS: {} - {}",
                            status.getCode(),
                            status.getMessage());
                    return false;
                }
            }
            return false;
        } catch (TencentCloudSDKException e) {
            logger.error("Error sending SMS via Tencent Cloud", e);
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "Tencent Cloud";
    }
}
