package com.course.system.mapper;

import com.course.system.entity.CourseEnrollment;
import com.course.system.entity.Course;
import com.course.system.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface CourseEnrollmentMapper {
    int insert(CourseEnrollment enrollment);
    int delete(@Param("studentId") String studentId, @Param("courseId") String courseId);
    CourseEnrollment selectByStudentAndCourse(@Param("studentId") String studentId, @Param("courseId") String courseId);
    List<Course> selectCoursesByStudent(String studentId);
    List<User> selectStudentsByCourse(String courseId);
    int countByStudent(String studentId);
    int countByCourse(String courseId);
}
