package com.course.system.service;

import com.course.system.entity.Course;
import com.course.system.mapper.CourseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseMapper courseMapper;

    @Override
    public Course createCourse(Course course) {
        if (course.getCourseId() == null) {
            course.setCourseId(UUID.randomUUID().toString());
        }
        if (course.getCourseStatus() == null) {
            course.setCourseStatus("NotStarted");
        }
        if (course.getEnrollmentCount() == null) {
            course.setEnrollmentCount(0);
        }
        courseMapper.insert(course);
        return course;
    }

    @Override
    public Course getCourseById(String courseId) {
        return courseMapper.selectById(courseId);
    }

    @Override
    public List<Course> getAllCourses() {
        return courseMapper.selectAll();
    }

    @Override
    public List<Course> getCoursesByTeacher(String teacherId) {
        return courseMapper.selectByTeacherId(teacherId);
    }

    @Override
    public boolean updateCourse(Course course) {
        return courseMapper.update(course) > 0;
    }

    @Override
    public boolean deleteCourse(String courseId) {
        return courseMapper.delete(courseId) > 0;
    }
}
