package com.course.system.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Feedback {
    private String feedbackId;
    private String assignmentId;
    private String studentId;
    private String feedbackContent;
    private Date publishTime;
}
