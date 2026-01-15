package com.course.system.sms;

/**
 * SMS Provider Interface
 * 短信发送服务接口
 */
public interface SmsProvider {

    /**
     * 发送短信验证码
     *
     * @param phoneNumber 手机号码
     * @param code        验证码
     * @return 发送是否成功
     */
    boolean sendVerificationCode(String phoneNumber, String code);

    /**
     * 获取提供商名称
     */
    String getProviderName();
}
