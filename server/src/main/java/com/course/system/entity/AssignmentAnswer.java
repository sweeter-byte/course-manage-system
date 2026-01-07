package com.course.system.entity;

import lombok.Data;
import java.util.Date;
import java.math.BigDecimal;

@Data
public class AssignmentAnswer {
    private String answerId;
    private String assignmentId;
    private String studentId;
    private String answerContent;
    private String answerStatus; // NotSubmitted, Submitted, Graded
    private String teacherFeedback;
    private BigDecimal score;
    private Date submissionTime;
}
