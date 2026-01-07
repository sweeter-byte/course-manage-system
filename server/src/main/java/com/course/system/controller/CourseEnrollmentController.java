package com.course.system.controller;

import com.course.system.entity.Course;
import com.course.system.entity.CourseEnrollment;
import com.course.system.entity.User;
import com.course.system.service.CourseEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class CourseEnrollmentController {

    @Autowired
    private CourseEnrollmentService courseEnrollmentService;

    /**
     * Enroll a student in a course
     * Request body: { "studentId": "...", "courseId": "..." }
     */
    @PostMapping("/enroll")
    public Map<String, Object> enroll(@RequestBody Map<String, String> enrollData) {
        Map<String, Object> response = new HashMap<>();
        
        String studentId = enrollData.get("studentId");
        String courseId = enrollData.get("courseId");
        
        if (studentId == null || courseId == null) {
            response.put("code", 400);
            response.put("message", "Missing required fields: studentId and courseId");
            return response;
        }
        
        CourseEnrollment enrollment = courseEnrollmentService.enroll(studentId, courseId);
        if (enrollment != null) {
            response.put("code", 200);
            response.put("message", "Enrollment successful");
            response.put("data", enrollment);
        } else {
            response.put("code", 400);
            response.put("message", "Already enrolled in this course");
        }
        return response;
    }

    /**
     * Withdraw a student from a course
     */
    @DeleteMapping("/withdraw")
    public Map<String, Object> withdraw(@RequestParam String studentId, @RequestParam String courseId) {
        Map<String, Object> response = new HashMap<>();
        
        boolean success = courseEnrollmentService.withdraw(studentId, courseId);
        if (success) {
            response.put("code", 200);
            response.put("message", "Withdrawal successful");
        } else {
            response.put("code", 400);
            response.put("message", "Not enrolled in this course");
        }
        return response;
    }

    /**
     * Check if a student is enrolled in a course
     */
    @GetMapping("/check")
    public Map<String, Object> checkEnrollment(@RequestParam String studentId, @RequestParam String courseId) {
        Map<String, Object> response = new HashMap<>();
        boolean enrolled = courseEnrollmentService.isEnrolled(studentId, courseId);
        response.put("code", 200);
        response.put("enrolled", enrolled);
        return response;
    }

    /**
     * Get all courses that a student is enrolled in
     */
    @GetMapping("/my-courses")
    public Map<String, Object> getMyCourses(@RequestParam String studentId) {
        Map<String, Object> response = new HashMap<>();
        List<Course> courses = courseEnrollmentService.getCoursesByStudent(studentId);
        response.put("code", 200);
        response.put("data", courses);
        return response;
    }

    /**
     * Get all students enrolled in a course
     */
    @GetMapping("/course-students")
    public Map<String, Object> getCourseStudents(@RequestParam String courseId) {
        Map<String, Object> response = new HashMap<>();
        List<User> students = courseEnrollmentService.getStudentsByCourse(courseId);
        response.put("code", 200);
        response.put("data", students);
        response.put("count", students.size());
        return response;
    }
}
