package com.course.system.service;

import com.course.system.entity.AssignmentAnswer;
import java.util.List;

public interface AssignmentAnswerService {
    AssignmentAnswer submitAnswer(AssignmentAnswer answer);
    AssignmentAnswer getAnswer(String assignmentId, String studentId);
    List<AssignmentAnswer> getAnswersByAssignment(String assignmentId);
    AssignmentAnswer gradeAnswer(String answerId, String feedback, Double score);
}
