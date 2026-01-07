package com.course.system.service;

import com.course.system.entity.Assignment;
import com.course.system.mapper.AssignmentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    @Autowired
    private AssignmentMapper assignmentMapper;

    @Override
    public Assignment createAssignment(Assignment assignment) {
        if (assignment.getAssignmentId() == null) {
            assignment.setAssignmentId(UUID.randomUUID().toString());
        }
        if (assignment.getAssignmentStatus() == null) {
            assignment.setAssignmentStatus("NotStarted");
        }
        assignmentMapper.insert(assignment);
        return assignment;
    }

    @Override
    public List<Assignment> getAssignmentsByCourse(String courseId) {
        return assignmentMapper.selectByCourseId(courseId);
    }

    @Override
    public Assignment getAssignmentById(String assignmentId) {
        return assignmentMapper.selectById(assignmentId);
    }
}
