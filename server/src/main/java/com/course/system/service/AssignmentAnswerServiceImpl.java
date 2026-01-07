package com.course.system.service;

import com.course.system.entity.AssignmentAnswer;
import com.course.system.mapper.AssignmentAnswerMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class AssignmentAnswerServiceImpl implements AssignmentAnswerService {

    @Autowired
    private AssignmentAnswerMapper assignmentAnswerMapper;

    @Override
    public AssignmentAnswer submitAnswer(AssignmentAnswer answer) {
        AssignmentAnswer existing = assignmentAnswerMapper.selectByAssignmentAndStudent(answer.getAssignmentId(), answer.getStudentId());
        if (existing != null) {
            // Update existing submission
            existing.setAnswerContent(answer.getAnswerContent());
            existing.setSubmissionTime(new Date());
            existing.setAnswerStatus("Submitted");
            assignmentAnswerMapper.update(existing);
            return existing;
        } else {
            // Create new submission
            if (answer.getAnswerId() == null) {
                answer.setAnswerId(UUID.randomUUID().toString());
            }
            answer.setSubmissionTime(new Date());
            answer.setAnswerStatus("Submitted");
            assignmentAnswerMapper.insert(answer);
            return answer;
        }
    }

    @Override
    public AssignmentAnswer getAnswer(String assignmentId, String studentId) {
        return assignmentAnswerMapper.selectByAssignmentAndStudent(assignmentId, studentId);
    }

    @Override
    public List<AssignmentAnswer> getAnswersByAssignment(String assignmentId) {
        return assignmentAnswerMapper.selectByAssignmentId(assignmentId);
    }
    
    @Override
    public AssignmentAnswer gradeAnswer(String answerId, String feedback, Double score) {
        AssignmentAnswer answer = assignmentAnswerMapper.selectById(answerId);
        if (answer != null) {
            answer.setTeacherFeedback(feedback);
            answer.setScore(BigDecimal.valueOf(score));
            answer.setAnswerStatus("Graded");
            assignmentAnswerMapper.update(answer);
        }
        return answer;
    }
}
