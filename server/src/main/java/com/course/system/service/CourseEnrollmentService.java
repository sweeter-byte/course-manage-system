package com.course.system.service;

import com.course.system.entity.Course;
import com.course.system.entity.CourseEnrollment;
import com.course.system.entity.User;
import java.util.List;

public interface CourseEnrollmentService {
    /**
     * Enroll a student in a course
     * @param studentId the student's user ID
     * @param courseId the course ID
     * @return the enrollment record, or null if already enrolled
     */
    CourseEnrollment enroll(String studentId, String courseId);

    /**
     * Withdraw a student from a course
     * @param studentId the student's user ID
     * @param courseId the course ID
     * @return true if withdrawal was successful
     */
    boolean withdraw(String studentId, String courseId);

    /**
     * Check if a student is enrolled in a course
     * @param studentId the student's user ID
     * @param courseId the course ID
     * @return true if enrolled
     */
    boolean isEnrolled(String studentId, String courseId);

    /**
     * Get all courses that a student is enrolled in
     * @param studentId the student's user ID
     * @return list of courses
     */
    List<Course> getCoursesByStudent(String studentId);

    /**
     * Get all students enrolled in a course
     * @param courseId the course ID
     * @return list of students (User objects without password)
     */
    List<User> getStudentsByCourse(String courseId);

    /**
     * Get enrollment count for a course
     */
    int getEnrollmentCount(String courseId);
}
