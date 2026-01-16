import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Upload, Modal, Form, Input, Select,
    message, Space, Typography, Tag, Popconfirm, Spin
} from 'antd';
import {
    UploadOutlined, DeleteOutlined, DownloadOutlined,
    FileTextOutlined, VideoCameraOutlined, FileOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { getCurrentUser } from '../../services/auth';
import { getCoursesByTeacher } from '../../services/course';
import {
    uploadResource,
    getResourcesByCourse,
    deleteResource,
    formatFileSize,
    getResourceTypeLabel,
    CourseResource
} from '../../services/resource';
import { Course } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ResourceManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [resources, setResources] = useState<CourseResource[]>([]);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
    const user = getCurrentUser();

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            loadResources();
        }
    }, [selectedCourse]);

    const loadCourses = async () => {
        if (!user?.userId) return;
        setLoading(true);
        try {
            const coursesData = await getCoursesByTeacher(user.userId);
            setCourses(coursesData);
            if (coursesData.length > 0) {
                setSelectedCourse(coursesData[0].courseId);
            }
        } catch (error) {
            message.error('加载课程失败');
        } finally {
            setLoading(false);
        }
    };

    const loadResources = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const data = await getResourcesByCourse(selectedCourse);
            setResources(data);
        } catch (error) {
            message.error('加载资源失败');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (values: {
        resourceName: string;
        resourceType: string;
        description?: string;
    }) => {
        if (fileList.length === 0) {
            message.error('请选择文件');
            return;
        }

        setUploading(true);
        try {
            const file = fileList[0].originFileObj;
            const result = await uploadResource(
                file,
                selectedCourse,
                values.resourceName,
                values.resourceType,
                values.description
            );

            if (result) {
                message.success('上传成功');
                setUploadModalVisible(false);
                form.resetFields();
                setFileList([]);
                loadResources();
            } else {
                message.error('上传失败');
            }
        } catch (error) {
            message.error('上传失败');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (resourceId: string) => {
        const success = await deleteResource(resourceId);
        if (success) {
            message.success('删除成功');
            loadResources();
        } else {
            message.error('删除失败');
        }
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <VideoCameraOutlined />;
            case 'document':
                return <FileTextOutlined />;
            default:
                return <FileOutlined />;
        }
    };

    const uploadProps: UploadProps = {
        beforeUpload: () => false,
        onChange: (info) => {
            setFileList(info.fileList.slice(-1));
        },
        fileList,
        maxCount: 1,
    };

    const columns = [
        {
            title: '资源名称',
            dataIndex: 'resourceName',
            key: 'resourceName',
            render: (name: string, record: CourseResource) => (
                <Space>
                    {getResourceIcon(record.resourceType)}
                    <Text>{name}</Text>
                </Space>
            ),
        },
        {
            title: '类型',
            dataIndex: 'resourceType',
            key: 'resourceType',
            width: 100,
            render: (type: string) => (
                <Tag color="blue">{getResourceTypeLabel(type)}</Tag>
            ),
        },
        {
            title: '文件大小',
            dataIndex: 'fileSize',
            key: 'fileSize',
            width: 120,
            render: (size: number) => formatFileSize(size),
        },
        {
            title: '下载次数',
            dataIndex: 'downloadCount',
            key: 'downloadCount',
            width: 100,
        },
        {
            title: '上传时间',
            dataIndex: 'uploadTime',
            key: 'uploadTime',
            width: 180,
            render: (time: string) => time ? new Date(time).toLocaleString() : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: CourseResource) => (
                <Space>
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        href={record.downloadUrl}
                        target="_blank"
                    >
                        下载
                    </Button>
                    <Popconfirm
                        title="确定删除此资源吗？"
                        onConfirm={() => handleDelete(record.resourceId)}
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading && courses.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>课程资源管理</Title>

            {/* Course Selection & Upload Button */}
            <Card style={{ marginBottom: 16 }}>
                <Space size="large">
                    <div>
                        <Text style={{ marginRight: 8 }}>选择课程：</Text>
                        <Select
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            style={{ width: 300 }}
                            placeholder="请选择课程"
                        >
                            {courses.map(course => (
                                <Option key={course.courseId} value={course.courseId}>
                                    {course.courseName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => setUploadModalVisible(true)}
                        disabled={!selectedCourse}
                    >
                        上传资源
                    </Button>
                </Space>
            </Card>

            {/* Resources Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={resources}
                    rowKey="resourceId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: '暂无资源，点击上方按钮上传' }}
                />
            </Card>

            {/* Upload Modal */}
            <Modal
                title="上传课程资源"
                open={uploadModalVisible}
                onCancel={() => {
                    setUploadModalVisible(false);
                    form.resetFields();
                    setFileList([]);
                }}
                footer={null}
                width={500}
            >
                <Form form={form} onFinish={handleUpload} layout="vertical">
                    <Form.Item
                        name="file"
                        label="选择文件"
                        rules={[{ required: true, message: '请选择文件' }]}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>选择文件</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="resourceName"
                        label="资源名称"
                        rules={[{ required: true, message: '请输入资源名称' }]}
                    >
                        <Input placeholder="请输入资源名称" />
                    </Form.Item>

                    <Form.Item
                        name="resourceType"
                        label="资源类型"
                        initialValue="courseware"
                    >
                        <Select>
                            <Option value="courseware">课件</Option>
                            <Option value="document">文档</Option>
                            <Option value="video">视频</Option>
                            <Option value="other">其他</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="资源描述"
                    >
                        <TextArea rows={3} placeholder="请输入资源描述（选填）" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button onClick={() => setUploadModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" loading={uploading}>
                                上传
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResourceManagement;
