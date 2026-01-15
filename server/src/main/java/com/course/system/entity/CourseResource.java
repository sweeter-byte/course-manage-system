package com.course.system.entity;

import lombok.Data;
import java.util.Date;

/**
 * 课程资源实体
 * 用于存储课件、文档等教学资源信息
 */
@Data
public class CourseResource {

    /**
     * 资源ID (UUID)
     */
    private String resourceId;

    /**
     * 所属课程ID
     */
    private String courseId;

    /**
     * 上传者ID (教师)
     */
    private String uploaderId;

    /**
     * 资源名称 (显示名称)
     */
    private String resourceName;

    /**
     * 原始文件名
     */
    private String originalFileName;

    /**
     * 存储文件名 (UUID + 扩展名)
     */
    private String storedFileName;

    /**
     * 文件路径
     */
    private String filePath;

    /**
     * 文件大小 (字节)
     */
    private Long fileSize;

    /**
     * 文件类型/MIME类型
     */
    private String fileType;

    /**
     * 资源类型: courseware(课件), document(文档), video(视频), other(其他)
     */
    private String resourceType;

    /**
     * 资源描述
     */
    private String description;

    /**
     * 下载次数
     */
    private Integer downloadCount;

    /**
     * 上传时间
     */
    private Date uploadTime;

    /**
     * 是否可见
     */
    private Boolean visible;
}
