package com.course.system.controller;

import com.course.system.entity.AssignmentAnswer;
import com.course.system.service.AssignmentAnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/answers")
public class AssignmentAnswerController {

    @Autowired
    private AssignmentAnswerService assignmentAnswerService;

    @PostMapping("/submit")
    public Map<String, Object> submitAnswer(@RequestBody AssignmentAnswer answer) {
        AssignmentAnswer submitted = assignmentAnswerService.submitAnswer(answer);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "Answer submitted successfully");
        response.put("data", submitted);
        return response;
    }

    @GetMapping
    public Map<String, Object> getAnswers(@RequestParam String assignmentId) {
        List<AssignmentAnswer> answers = assignmentAnswerService.getAnswersByAssignment(assignmentId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", answers);
        return response;
    }
    
    @GetMapping("/my")
    public Map<String, Object> getMyAnswer(@RequestParam String assignmentId, @RequestParam String studentId) {
        AssignmentAnswer answer = assignmentAnswerService.getAnswer(assignmentId, studentId);
        Map<String, Object> response = new HashMap<>();
        if (answer != null) {
            response.put("code", 200);
            response.put("data", answer);
        } else {
            response.put("code", 404);
            response.put("message", "No submission found");
        }
        return response;
    }

    /**
     * Teacher grading endpoint
     * Request body: { "answerId": "...", "feedback": "...", "score": 85.0 }
     */
    @PostMapping("/grade")
    public Map<String, Object> gradeAnswer(@RequestBody Map<String, Object> gradeData) {
        Map<String, Object> response = new HashMap<>();
        
        String answerId = (String) gradeData.get("answerId");
        String feedback = (String) gradeData.get("feedback");
        Double score = null;
        
        // Handle score conversion (could be Integer or Double from JSON)
        Object scoreObj = gradeData.get("score");
        if (scoreObj instanceof Number) {
            score = ((Number) scoreObj).doubleValue();
        }
        
        if (answerId == null || score == null) {
            response.put("code", 400);
            response.put("message", "Missing required fields: answerId and score");
            return response;
        }
        
        AssignmentAnswer graded = assignmentAnswerService.gradeAnswer(answerId, feedback, score);
        if (graded != null) {
            response.put("code", 200);
            response.put("message", "Answer graded successfully");
            response.put("data", graded);
        } else {
            response.put("code", 404);
            response.put("message", "Answer not found");
        }
        return response;
    }
}
