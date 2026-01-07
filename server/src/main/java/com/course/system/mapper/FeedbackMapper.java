package com.course.system.mapper;

import com.course.system.entity.Feedback;
import com.course.system.entity.Response;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface FeedbackMapper {
    int insertFeedback(Feedback feedback);
    List<Feedback> selectFeedbacksByAssignment(String assignmentId);
    
    int insertResponse(Response response);
    List<Response> selectResponsesByFeedback(String feedbackId);
}
