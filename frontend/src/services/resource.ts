import api from './api';

export interface CourseResource {
    resourceId: string;
    courseId: string;
    uploaderId: string;
    resourceName: string;
    originalFileName: string;
    storedFileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    resourceType: string;
    description: string;
    downloadCount: number;
    uploadTime: string;
    visible: boolean;
    downloadUrl?: string;
}

interface UploadResponse {
    code: number;
    message: string;
    data?: {
        resourceId: string;
        resourceName: string;
        originalFileName: string;
        fileSize: number;
        fileType: string;
        resourceType: string;
        downloadUrl: string;
        uploadTime: string;
    };
}

interface ResourceListResponse {
    code: number;
    data: CourseResource[];
    baseUrl: string;
}

/**
 * Upload a course resource
 */
export const uploadResource = async (
    file: File,
    courseId: string,
    resourceName?: string,
    resourceType: string = 'courseware',
    description?: string
): Promise<UploadResponse['data'] | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    if (resourceName) formData.append('resourceName', resourceName);
    formData.append('resourceType', resourceType);
    if (description) formData.append('description', description);

    try {
        const response = await api.post<UploadResponse>('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        if (response.data.code === 200) {
            return response.data.data || null;
        }
        return null;
    } catch (error) {
        console.error('Upload failed:', error);
        return null;
    }
};

/**
 * Get resources by course
 */
export const getResourcesByCourse = async (courseId: string): Promise<CourseResource[]> => {
    try {
        const response = await api.get<ResourceListResponse>(`/files/course/${courseId}`);
        if (response.data.code === 200) {
            const baseUrl = response.data.baseUrl;
            return response.data.data.map(resource => ({
                ...resource,
                downloadUrl: baseUrl + resource.resourceId,
            }));
        }
        return [];
    } catch (error) {
        console.error('Failed to get resources:', error);
        return [];
    }
};

/**
 * Delete a resource
 */
export const deleteResource = async (resourceId: string): Promise<boolean> => {
    try {
        const response = await api.delete<{ code: number }>(`/files/${resourceId}`);
        return response.data.code === 200;
    } catch (error) {
        console.error('Delete failed:', error);
        return false;
    }
};

/**
 * Update resource visibility
 */
export const updateResourceVisibility = async (
    resourceId: string,
    visible: boolean
): Promise<boolean> => {
    try {
        const response = await api.put<{ code: number }>(
            `/files/${resourceId}/visibility?visible=${visible}`
        );
        return response.data.code === 200;
    } catch (error) {
        console.error('Update visibility failed:', error);
        return false;
    }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get resource type label
 */
export const getResourceTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        courseware: '课件',
        document: '文档',
        video: '视频',
        other: '其他',
    };
    return labels[type] || type;
};
