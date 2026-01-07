package com.course.system.controller;

import com.course.system.entity.Assignment;
import com.course.system.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @PostMapping
    public Map<String, Object> createAssignment(@RequestBody Assignment assignment) {
        Assignment created = assignmentService.createAssignment(assignment);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "Assignment created successfully");
        response.put("assignment", created);
        return response;
    }

    @GetMapping
    public Map<String, Object> getAssignments(@RequestParam String courseId) {
        List<Assignment> assignments = assignmentService.getAssignmentsByCourse(courseId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", assignments);
        return response;
    }
}
