package com.course.system.service;

import com.course.system.entity.CourseResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseResourceService {

    /**
     * 上传课程资源
     */
    CourseResource uploadResource(String courseId, String uploaderId, MultipartFile file,
                                   String resourceName, String resourceType, String description);

    /**
     * 获取资源信息
     */
    CourseResource getResourceById(String resourceId);

    /**
     * 获取课程的所有资源
     */
    List<CourseResource> getResourcesByCourse(String courseId);

    /**
     * 获取教师上传的所有资源
     */
    List<CourseResource> getResourcesByUploader(String uploaderId);

    /**
     * 删除资源
     */
    boolean deleteResource(String resourceId);

    /**
     * 更新资源信息
     */
    boolean updateResource(CourseResource resource);

    /**
     * 增加下载次数
     */
    void incrementDownloadCount(String resourceId);

    /**
     * 更新可见性
     */
    boolean updateVisibility(String resourceId, boolean visible);

    /**
     * 获取资源文件路径
     */
    String getResourceFilePath(String resourceId);
}
