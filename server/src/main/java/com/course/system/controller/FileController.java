package com.course.system.controller;

import com.course.system.entity.CourseResource;
import com.course.system.service.CourseResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 文件上传/下载控制器
 * 用于课程资源（课件、文档等）的管理
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private CourseResourceService resourceService;

    @Value("${file.base-url:http://localhost:8080/api/files}")
    private String baseUrl;

    /**
     * 上传课程资源
     * POST /api/files/upload
     */
    @PostMapping("/upload")
    public Map<String, Object> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") String courseId,
            @RequestParam(value = "resourceName", required = false) String resourceName,
            @RequestParam(value = "resourceType", required = false, defaultValue = "courseware") String resourceType,
            @RequestParam(value = "description", required = false) String description) {

        Map<String, Object> response = new HashMap<>();

        try {
            // 获取当前用户ID
            String uploaderId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            CourseResource resource = resourceService.uploadResource(
                    courseId, uploaderId, file, resourceName, resourceType, description);

            if (resource != null) {
                // 添加下载URL
                String downloadUrl = baseUrl + "/download/" + resource.getResourceId();

                Map<String, Object> resourceData = new HashMap<>();
                resourceData.put("resourceId", resource.getResourceId());
                resourceData.put("resourceName", resource.getResourceName());
                resourceData.put("originalFileName", resource.getOriginalFileName());
                resourceData.put("fileSize", resource.getFileSize());
                resourceData.put("fileType", resource.getFileType());
                resourceData.put("resourceType", resource.getResourceType());
                resourceData.put("downloadUrl", downloadUrl);
                resourceData.put("uploadTime", resource.getUploadTime());

                response.put("code", 200);
                response.put("message", "Upload successful");
                response.put("data", resourceData);
            } else {
                response.put("code", 500);
                response.put("message", "Upload failed");
            }
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "Upload error: " + e.getMessage());
        }

        return response;
    }

    /**
     * 获取课程的所有资源
     * GET /api/files/course/{courseId}
     */
    @GetMapping("/course/{courseId}")
    public Map<String, Object> getResourcesByCourse(@PathVariable String courseId) {
        Map<String, Object> response = new HashMap<>();

        List<CourseResource> resources = resourceService.getResourcesByCourse(courseId);

        // 添加下载URL
        for (CourseResource resource : resources) {
            // 使用额外字段存储下载URL（通过response返回）
        }

        response.put("code", 200);
        response.put("data", resources);
        response.put("baseUrl", baseUrl + "/download/");
        return response;
    }

    /**
     * 获取资源详情
     * GET /api/files/{resourceId}
     */
    @GetMapping("/{resourceId}")
    public Map<String, Object> getResourceById(@PathVariable String resourceId) {
        Map<String, Object> response = new HashMap<>();

        CourseResource resource = resourceService.getResourceById(resourceId);
        if (resource != null) {
            response.put("code", 200);
            response.put("data", resource);
            response.put("downloadUrl", baseUrl + "/download/" + resourceId);
        } else {
            response.put("code", 404);
            response.put("message", "Resource not found");
        }
        return response;
    }

    /**
     * 下载资源
     * GET /api/files/download/{resourceId}
     */
    @GetMapping("/download/{resourceId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String resourceId) {
        CourseResource courseResource = resourceService.getResourceById(resourceId);

        if (courseResource == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path filePath = Paths.get(courseResource.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // 增加下载次数
                resourceService.incrementDownloadCount(resourceId);

                // 处理文件名编码
                String encodedFileName = URLEncoder.encode(
                        courseResource.getOriginalFileName(), StandardCharsets.UTF_8)
                        .replace("+", "%20");

                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename*=UTF-8''" + encodedFileName)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 删除资源
     * DELETE /api/files/{resourceId}
     */
    @DeleteMapping("/{resourceId}")
    public Map<String, Object> deleteResource(@PathVariable String resourceId) {
        Map<String, Object> response = new HashMap<>();

        boolean success = resourceService.deleteResource(resourceId);
        if (success) {
            response.put("code", 200);
            response.put("message", "Resource deleted successfully");
        } else {
            response.put("code", 400);
            response.put("message", "Failed to delete resource");
        }
        return response;
    }

    /**
     * 更新资源可见性
     * PUT /api/files/{resourceId}/visibility
     */
    @PutMapping("/{resourceId}/visibility")
    public Map<String, Object> updateVisibility(
            @PathVariable String resourceId,
            @RequestParam boolean visible) {

        Map<String, Object> response = new HashMap<>();

        boolean success = resourceService.updateVisibility(resourceId, visible);
        if (success) {
            response.put("code", 200);
            response.put("message", "Visibility updated");
        } else {
            response.put("code", 400);
            response.put("message", "Update failed");
        }
        return response;
    }
}
