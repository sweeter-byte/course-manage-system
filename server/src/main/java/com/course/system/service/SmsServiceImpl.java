package com.course.system.service;

import com.course.system.entity.SmsVerificationCode;
import com.course.system.mapper.SmsVerificationCodeMapper;
import com.course.system.sms.SmsProviderFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.Random;

@Service
public class SmsServiceImpl implements SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsServiceImpl.class);

    @Autowired
    private SmsVerificationCodeMapper codeMapper;

    @Autowired
    private SmsProviderFactory smsProviderFactory;

    private static final int CODE_LENGTH = 6;
    private static final int EXPIRE_MINUTES = 5;

    @Override
    public boolean sendCode(String phoneNumber, String type) {
        String code = generateCode();

        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, EXPIRE_MINUTES);
        Date expiresAt = calendar.getTime();

        SmsVerificationCode smsCode = new SmsVerificationCode();
        smsCode.setPhoneNumber(phoneNumber);
        smsCode.setCode(code);
        smsCode.setType(type);
        smsCode.setExpiresAt(expiresAt);
        smsCode.setUsed(false);

        int result = codeMapper.insert(smsCode);

        if (result > 0) {
            boolean sent = smsProviderFactory.getProvider().sendVerificationCode(phoneNumber, code);
            if (sent) {
                logger.info("Code sent to {} via {}", phoneNumber, smsProviderFactory.getProviderName());
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean verifyCode(String phoneNumber, String code, String type) {
        SmsVerificationCode smsCode = codeMapper.findLatestValid(phoneNumber, type);
        if (smsCode != null && smsCode.getCode().equals(code)) {
            codeMapper.markAsUsed(smsCode.getId());
            return true;
        }
        return false;
    }

    private String generateCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
