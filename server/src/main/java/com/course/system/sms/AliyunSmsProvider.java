package com.course.system.sms;

import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.dysmsapi20170525.models.SendSmsResponse;
import com.aliyun.teaopenapi.models.Config;
import com.course.system.config.SmsConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Aliyun SMS Provider
 * 阿里云短信服务实现
 *
 * 使用前请完成以下步骤:
 * 1. 注册阿里云账号: https://www.aliyun.com
 * 2. 开通短信服务: https://www.aliyun.com/product/sms
 * 3. 创建 AccessKey: https://ram.console.aliyun.com/manage/ak
 * 4. 添加短信签名和模板: https://dysms.console.aliyun.com
 * 5. 在 application.properties 中配置相关参数
 */
public class AliyunSmsProvider implements SmsProvider {

    private static final Logger logger = LoggerFactory.getLogger(AliyunSmsProvider.class);

    private final SmsConfig.AliyunConfig config;
    private Client client;

    public AliyunSmsProvider(SmsConfig.AliyunConfig config) {
        this.config = config;
        initClient();
    }

    private void initClient() {
        try {
            Config clientConfig = new Config()
                    .setAccessKeyId(config.getAccessKeyId())
                    .setAccessKeySecret(config.getAccessKeySecret())
                    .setEndpoint("dysmsapi.aliyuncs.com");
            this.client = new Client(clientConfig);
            logger.info("Aliyun SMS client initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Aliyun SMS client", e);
        }
    }

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {
        if (client == null) {
            logger.error("Aliyun SMS client not initialized");
            return false;
        }

        try {
            SendSmsRequest request = new SendSmsRequest()
                    .setPhoneNumbers(phoneNumber)
                    .setSignName(config.getSignName())
                    .setTemplateCode(config.getTemplateCode())
                    .setTemplateParam("{\"code\":\"" + code + "\"}");

            SendSmsResponse response = client.sendSms(request);

            if ("OK".equals(response.getBody().getCode())) {
                logger.info("SMS sent successfully to {} via Aliyun", phoneNumber);
                return true;
            } else {
                logger.error("Failed to send SMS: {} - {}",
                        response.getBody().getCode(),
                        response.getBody().getMessage());
                return false;
            }
        } catch (Exception e) {
            logger.error("Error sending SMS via Aliyun", e);
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "Aliyun";
    }
}
