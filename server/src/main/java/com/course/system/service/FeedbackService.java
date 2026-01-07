package com.course.system.service;

import com.course.system.entity.Feedback;
import com.course.system.entity.Response;
import java.util.List;

public interface FeedbackService {
    Feedback createFeedback(Feedback feedback);
    List<Feedback> getFeedbacksByAssignment(String assignmentId);
    
    Response createResponse(Response response);
    List<Response> getResponsesByFeedback(String feedbackId);
}
