package com.course.system.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Assignment {
    private String assignmentId;
    private String courseId;
    private String teacherId;
    private String assignmentTitle;
    private String assignmentContent;
    private Date startTime;
    private Date endTime;
    private String assignmentStatus; // NotStarted, Ongoing, Ended
}
