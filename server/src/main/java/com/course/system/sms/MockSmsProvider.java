package com.course.system.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Mock SMS Provider
 * 模拟短信发送服务（开发测试用）
 *
 * 此提供者仅在控制台打印验证码，不实际发送短信
 * 适用于本地开发和测试环境
 *
 * 生产环境请切换到 aliyun 或 tencent 模式
 */
public class MockSmsProvider implements SmsProvider {

    private static final Logger logger = LoggerFactory.getLogger(MockSmsProvider.class);

    @Override
    public boolean sendVerificationCode(String phoneNumber, String code) {
        // 在控制台打印验证码信息
        System.out.println();
        System.out.println("╔════════════════════════════════════════════════════════════╗");
        System.out.println("║            【短信验证码 - 模拟发送】                        ║");
        System.out.println("╠════════════════════════════════════════════════════════════╣");
        System.out.println("║  手机号: " + padRight(phoneNumber, 48) + "║");
        System.out.println("║  验证码: " + padRight(code, 48) + "║");
        System.out.println("║  有效期: " + padRight("5 分钟", 48) + "║");
        System.out.println("╠════════════════════════════════════════════════════════════╣");
        System.out.println("║  提示: 当前为模拟模式，验证码不会真实发送                   ║");
        System.out.println("║  切换真实短信服务请修改 sms.provider 配置                   ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝");
        System.out.println();

        logger.info("[MOCK SMS] Code {} sent to {}", code, phoneNumber);
        return true;
    }

    private String padRight(String s, int n) {
        // 处理中文字符宽度
        int actualLength = 0;
        for (char c : s.toCharArray()) {
            actualLength += (c >= '\u4e00' && c <= '\u9fa5') ? 2 : 1;
        }
        int padding = n - actualLength;
        if (padding > 0) {
            return s + " ".repeat(padding);
        }
        return s;
    }

    @Override
    public String getProviderName() {
        return "Mock (Development)";
    }
}
