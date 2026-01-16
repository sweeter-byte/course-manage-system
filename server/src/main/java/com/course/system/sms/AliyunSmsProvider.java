package com.course.system.sms;

import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.dysmsapi20170525.models.SendSmsResponse;
import com.aliyun.teaopenapi.models.Config;
import com.course.system.config.SmsConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
            logger.info("Aliyun SMS client initialized");
        } catch (Exception e) {
            logger.error("Failed to init Aliyun SMS client", e);
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
                logger.info("SMS sent to {} via Aliyun", phoneNumber);
                return true;
            }
            logger.error("Aliyun SMS failed: {}", response.getBody().getMessage());
            return false;
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
