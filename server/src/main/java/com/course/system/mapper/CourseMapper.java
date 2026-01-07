package com.course.system.mapper;

import com.course.system.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface CourseMapper {
    int insert(Course course);
    Course selectById(String courseId);
    List<Course> selectAll();
    List<Course> selectByTeacherId(String teacherId);
    int update(Course course);
    int delete(String courseId);
}
