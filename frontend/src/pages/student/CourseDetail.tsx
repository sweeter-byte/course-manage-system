import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, List, Tag, Button, Descriptions, Divider } from 'antd';
import {
    BookOutlined,
    FormOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getAssignmentsByCourse } from '../../services/assignment';
import { Assignment, Course } from '../../types';
import api from '../../services/api';

const { Title, Text } = Typography;

interface ApiResponse<T> {
    code: number;
    data?: T;
    message?: string;
}

const StudentCourseDetail: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<Course | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (courseId) {
            loadData();
        }
    }, [courseId]);

    const loadData = async () => {
        if (!courseId) return;

        setLoading(true);
        try {
            // Load course details
            const courseResponse = await api.get<ApiResponse<Course>>(`/courses/${courseId}`);
            if (courseResponse.data.code === 200 && courseResponse.data.data) {
                setCourse(courseResponse.data.data);
            }

            // Load assignments
            const assignmentsData = await getAssignmentsByCourse(courseId);
            setAssignments(assignmentsData);
        } catch (error) {
            console.error('Failed to load course data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!course) {
        return <Empty description="课程不存在" />;
    }

    return (
        <div>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/student/courses')}
                style={{ marginBottom: 16 }}
            >
                返回课程列表
            </Button>

            {/* Course Header */}
            <Card
                style={{
                    marginBottom: 24,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    borderRadius: 12
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <BookOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />
                    <div>
                        <Title level={3} style={{ color: '#fff', margin: 0 }}>
                            {course.courseName}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                            {course.courseDescription || '暂无课程描述'}
                        </Text>
                    </div>
                </div>
            </Card>

            {/* Course Info */}
            <Card title="课程信息" style={{ marginBottom: 24 }}>
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                    <Descriptions.Item label="课程ID">{course.courseId}</Descriptions.Item>
                    <Descriptions.Item label="创建时间">
                        {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '未知'}
                    </Descriptions.Item>
                    <Descriptions.Item label="作业数量">{assignments.length}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Divider />

            {/* Assignments List */}
            <Card title={`课程作业 (${assignments.length})`}>
                {assignments.length === 0 ? (
                    <Empty description="暂无作业" />
                ) : (
                    <List
                        dataSource={assignments}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        onClick={() => navigate(`/student/assignments/${item.assignmentId}`)}
                                    >
                                        查看作业
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 8,
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FormOutlined style={{ fontSize: 24, color: '#fff' }} />
                                        </div>
                                    }
                                    title={
                                        <Text strong style={{ fontSize: 16 }}>
                                            {item.assignmentTitle}
                                        </Text>
                                    }
                                    description={
                                        <div>
                                            <Text type="secondary" ellipsis style={{ display: 'block', marginBottom: 8 }}>
                                                {item.assignmentContent?.substring(0, 100) || '暂无内容'}
                                                {(item.assignmentContent?.length || 0) > 100 ? '...' : ''}
                                            </Text>
                                            <Tag icon={<ClockCircleOutlined />} color="blue">
                                                发布于 {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '未知'}
                                            </Tag>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default StudentCourseDetail;
