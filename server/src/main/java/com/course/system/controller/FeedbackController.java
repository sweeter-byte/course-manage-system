package com.course.system.controller;

import com.course.system.entity.Feedback;
import com.course.system.entity.Response;
import com.course.system.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping
    public Map<String, Object> createFeedback(@RequestBody Feedback feedback) {
        Feedback created = feedbackService.createFeedback(feedback);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", created);
        return response;
    }

    @GetMapping
    public Map<String, Object> getFeedbacks(@RequestParam String assignmentId) {
        List<Feedback> feedbacks = feedbackService.getFeedbacksByAssignment(assignmentId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", feedbacks);
        return response;
    }

    @PostMapping("/responses")
    public Map<String, Object> createResponse(@RequestBody Response reply) {
        Response created = feedbackService.createResponse(reply);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", created);
        return response;
    }

    @GetMapping("/{feedbackId}/responses")
    public Map<String, Object> getResponses(@PathVariable String feedbackId) {
        List<Response> responses = feedbackService.getResponsesByFeedback(feedbackId);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("data", responses);
        return response;
    }
}
