package com.course.system.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Response {
    private String responseId;
    private String feedbackId;
    private String teacherId;
    private String responseContent;
    private Date publishTime;
}
