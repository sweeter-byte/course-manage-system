package com.course.system.mapper;

import com.course.system.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserMapper {
    int insert(User user);
    User selectById(String userId);
    User selectByPhoneNumber(String phoneNumber);
    List<User> selectAll();
    int update(User user);
    int updatePassword(@Param("userId") String userId, @Param("password") String password);
    int delete(String userId);
}
