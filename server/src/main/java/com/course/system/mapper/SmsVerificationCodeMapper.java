package com.course.system.mapper;

import com.course.system.entity.SmsVerificationCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SmsVerificationCodeMapper {
    int insert(SmsVerificationCode code);

    SmsVerificationCode findLatestValid(@Param("phoneNumber") String phoneNumber,
            @Param("type") String type);

    int markAsUsed(@Param("id") Long id);

    int deleteExpired();
}
