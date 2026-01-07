package com.course.system.service;

import com.course.system.entity.Course;
import com.course.system.entity.CourseEnrollment;
import com.course.system.entity.User;
import com.course.system.mapper.CourseEnrollmentMapper;
import com.course.system.mapper.CourseMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class CourseEnrollmentServiceImpl implements CourseEnrollmentService {

    @Autowired
    private CourseEnrollmentMapper courseEnrollmentMapper;

    @Autowired
    private CourseMapper courseMapper;

    @Override
    @Transactional
    public CourseEnrollment enroll(String studentId, String courseId) {
        // Check if already enrolled
        if (courseEnrollmentMapper.selectByStudentAndCourse(studentId, courseId) != null) {
            return null; // Already enrolled
        }

        // Create enrollment record
        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setEnrollmentId(UUID.randomUUID().toString());
        enrollment.setStudentId(studentId);
        enrollment.setCourseId(courseId);
        enrollment.setEnrollmentTime(new Date());

        courseEnrollmentMapper.insert(enrollment);

        // Update course enrollment count
        Course course = courseMapper.selectById(courseId);
        if (course != null) {
            course.setEnrollmentCount(courseEnrollmentMapper.countByCourse(courseId));
            courseMapper.update(course);
        }

        return enrollment;
    }

    @Override
    @Transactional
    public boolean withdraw(String studentId, String courseId) {
        int deleted = courseEnrollmentMapper.delete(studentId, courseId);
        
        if (deleted > 0) {
            // Update course enrollment count
            Course course = courseMapper.selectById(courseId);
            if (course != null) {
                course.setEnrollmentCount(courseEnrollmentMapper.countByCourse(courseId));
                courseMapper.update(course);
            }
            return true;
        }
        return false;
    }

    @Override
    public boolean isEnrolled(String studentId, String courseId) {
        return courseEnrollmentMapper.selectByStudentAndCourse(studentId, courseId) != null;
    }

    @Override
    public List<Course> getCoursesByStudent(String studentId) {
        return courseEnrollmentMapper.selectCoursesByStudent(studentId);
    }

    @Override
    public List<User> getStudentsByCourse(String courseId) {
        List<User> students = courseEnrollmentMapper.selectStudentsByCourse(courseId);
        // Clear passwords for security
        for (User student : students) {
            student.setPassword(null);
        }
        return students;
    }

    @Override
    public int getEnrollmentCount(String courseId) {
        return courseEnrollmentMapper.countByCourse(courseId);
    }
}
