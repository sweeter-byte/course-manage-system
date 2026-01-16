package com.course.system.mapper;

import com.course.system.entity.CourseResource;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CourseResourceMapper {

    int insert(CourseResource resource);

    CourseResource selectById(@Param("resourceId") String resourceId);

    List<CourseResource> selectByCourseId(@Param("courseId") String courseId);

    List<CourseResource> selectByUploaderId(@Param("uploaderId") String uploaderId);

    int update(CourseResource resource);

    int delete(@Param("resourceId") String resourceId);

    int incrementDownloadCount(@Param("resourceId") String resourceId);

    int updateVisibility(@Param("resourceId") String resourceId, @Param("visible") Boolean visible);
}
