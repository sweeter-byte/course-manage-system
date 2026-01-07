package com.course.system.service;

import com.course.system.entity.Course;
import java.util.List;

public interface CourseService {
    Course createCourse(Course course);
    Course getCourseById(String courseId);
    List<Course> getAllCourses();
    List<Course> getCoursesByTeacher(String teacherId);
    boolean updateCourse(Course course);
    boolean deleteCourse(String courseId);
}
