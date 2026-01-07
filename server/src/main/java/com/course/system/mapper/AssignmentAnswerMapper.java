package com.course.system.mapper;

import com.course.system.entity.AssignmentAnswer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AssignmentAnswerMapper {
    int insert(AssignmentAnswer answer);
    AssignmentAnswer selectById(String answerId);
    List<AssignmentAnswer> selectByAssignmentId(String assignmentId);
    AssignmentAnswer selectByAssignmentAndStudent(@Param("assignmentId") String assignmentId, @Param("studentId") String studentId);
    int update(AssignmentAnswer answer);
}
