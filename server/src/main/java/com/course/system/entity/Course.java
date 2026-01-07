package com.course.system.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Course {
    private String courseId;
    private String creatorId; // User ID of who created it (usually teacher)
    private String teacherId;
    private String courseName;
    private String courseDescription;
    private Integer enrollmentCount;
    private Date courseStartDate;
    private Date courseEndDate;
    private String courseStatus; // NotStarted, Ongoing, Ended
    private String courseSemester;
    private String courseLocation;
}
