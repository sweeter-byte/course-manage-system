package com.course.system.service;

import com.course.system.entity.Feedback;
import com.course.system.entity.Response;
import com.course.system.mapper.FeedbackMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackMapper feedbackMapper;

    @Override
    public Feedback createFeedback(Feedback feedback) {
        if (feedback.getFeedbackId() == null) {
            feedback.setFeedbackId(UUID.randomUUID().toString());
        }
        feedback.setPublishTime(new Date());
        feedbackMapper.insertFeedback(feedback);
        return feedback;
    }

    @Override
    public List<Feedback> getFeedbacksByAssignment(String assignmentId) {
        return feedbackMapper.selectFeedbacksByAssignment(assignmentId);
    }

    @Override
    public Response createResponse(Response response) {
        if (response.getResponseId() == null) {
            response.setResponseId(UUID.randomUUID().toString());
        }
        response.setPublishTime(new Date());
        feedbackMapper.insertResponse(response);
        return response;
    }

    @Override
    public List<Response> getResponsesByFeedback(String feedbackId) {
        return feedbackMapper.selectResponsesByFeedback(feedbackId);
    }
}
