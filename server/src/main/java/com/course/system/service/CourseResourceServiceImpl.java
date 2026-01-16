package com.course.system.service;

import com.course.system.entity.CourseResource;
import com.course.system.mapper.CourseResourceMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class CourseResourceServiceImpl implements CourseResourceService {

    private static final Logger logger = LoggerFactory.getLogger(CourseResourceServiceImpl.class);

    @Autowired
    private CourseResourceMapper resourceMapper;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        // 确保上传目录存在
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (created) {
                logger.info("Created upload directory: {}", uploadDir);
            }
        }
    }

    @Override
    public CourseResource uploadResource(String courseId, String uploaderId, MultipartFile file,
                                          String resourceName, String resourceType, String description) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try {
            // 生成存储文件名
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String storedFileName = UUID.randomUUID().toString() + extension;

            // 按课程ID创建子目录
            String courseDir = uploadDir + File.separator + courseId;
            File courseDirFile = new File(courseDir);
            if (!courseDirFile.exists()) {
                courseDirFile.mkdirs();
            }

            // 保存文件
            String filePath = courseDir + File.separator + storedFileName;
            Path path = Paths.get(filePath);
            Files.write(path, file.getBytes());

            // 创建资源记录
            CourseResource resource = new CourseResource();
            resource.setResourceId(UUID.randomUUID().toString());
            resource.setCourseId(courseId);
            resource.setUploaderId(uploaderId);
            resource.setResourceName(resourceName != null ? resourceName : originalFileName);
            resource.setOriginalFileName(originalFileName);
            resource.setStoredFileName(storedFileName);
            resource.setFilePath(filePath);
            resource.setFileSize(file.getSize());
            resource.setFileType(file.getContentType());
            resource.setResourceType(resourceType != null ? resourceType : "other");
            resource.setDescription(description);
            resource.setDownloadCount(0);
            resource.setVisible(true);

            int result = resourceMapper.insert(resource);
            if (result > 0) {
                logger.info("Resource uploaded successfully: {} for course {}", resourceName, courseId);
                return resource;
            }
            return null;
        } catch (IOException e) {
            logger.error("Failed to upload resource", e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @Override
    public CourseResource getResourceById(String resourceId) {
        return resourceMapper.selectById(resourceId);
    }

    @Override
    public List<CourseResource> getResourcesByCourse(String courseId) {
        return resourceMapper.selectByCourseId(courseId);
    }

    @Override
    public List<CourseResource> getResourcesByUploader(String uploaderId) {
        return resourceMapper.selectByUploaderId(uploaderId);
    }

    @Override
    public boolean deleteResource(String resourceId) {
        CourseResource resource = resourceMapper.selectById(resourceId);
        if (resource == null) {
            return false;
        }

        // 删除文件
        try {
            Path path = Paths.get(resource.getFilePath());
            Files.deleteIfExists(path);
        } catch (IOException e) {
            logger.error("Failed to delete file: {}", resource.getFilePath(), e);
        }

        // 删除数据库记录
        return resourceMapper.delete(resourceId) > 0;
    }

    @Override
    public boolean updateResource(CourseResource resource) {
        return resourceMapper.update(resource) > 0;
    }

    @Override
    public void incrementDownloadCount(String resourceId) {
        resourceMapper.incrementDownloadCount(resourceId);
    }

    @Override
    public boolean updateVisibility(String resourceId, boolean visible) {
        return resourceMapper.updateVisibility(resourceId, visible) > 0;
    }

    @Override
    public String getResourceFilePath(String resourceId) {
        CourseResource resource = resourceMapper.selectById(resourceId);
        return resource != null ? resource.getFilePath() : null;
    }
}
