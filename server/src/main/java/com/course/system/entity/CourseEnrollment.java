package com.course.system.entity;

import lombok.Data;
import java.util.Date;

@Data
public class CourseEnrollment {
    private String enrollmentId;
    private String studentId;
    private String courseId;
    private Date enrollmentTime;
}
