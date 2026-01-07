package com.course.system.service;

import com.course.system.entity.Assignment;
import java.util.List;

public interface AssignmentService {
    Assignment createAssignment(Assignment assignment);
    List<Assignment> getAssignmentsByCourse(String courseId);
    Assignment getAssignmentById(String assignmentId);
}
