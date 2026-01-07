package com.course.system.controller;

import com.course.system.entity.Course;
import com.course.system.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @PostMapping
    public Map<String, Object> createCourse(@RequestBody Course course) {
        // Get current user ID from SecurityContext
        String userId = (String) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        course.setCreatorId(userId);
        
        Course createdCourse = courseService.createCourse(course);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "Course created successfully");
        response.put("course", createdCourse);
        return response;
    }

    @GetMapping
    public Map<String, Object> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", courses);
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getCourseById(@PathVariable String id) {
        Course course = courseService.getCourseById(id);
        Map<String, Object> response = new HashMap<>();
        if (course != null) {
            response.put("code", 200);
            response.put("data", course);
        } else {
            response.put("code", 404);
            response.put("message", "Course not found");
        }
        return response;
    }

    @GetMapping("/teacher/{teacherId}")
    public Map<String, Object> getCoursesByTeacher(@PathVariable String teacherId) {
        List<Course> courses = courseService.getCoursesByTeacher(teacherId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", courses);
        return response;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateCourse(@PathVariable String id, @RequestBody Course course) {
        Map<String, Object> response = new HashMap<>();
        course.setCourseId(id);
        boolean success = courseService.updateCourse(course);
        if (success) {
            response.put("code", 200);
            response.put("message", "Course updated successfully");
        } else {
            response.put("code", 400);
            response.put("message", "Failed to update course");
        }
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteCourse(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        boolean success = courseService.deleteCourse(id);
        if (success) {
            response.put("code", 200);
            response.put("message", "Course deleted successfully");
        } else {
            response.put("code", 400);
            response.put("message", "Failed to delete course");
        }
        return response;
    }
}
