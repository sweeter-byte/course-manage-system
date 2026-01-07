package com.course.system.mapper;

import com.course.system.entity.Assignment;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface AssignmentMapper {
    int insert(Assignment assignment);
    Assignment selectById(String assignmentId);
    List<Assignment> selectByCourseId(String courseId);
    int update(Assignment assignment);
    int delete(String assignmentId);
}
