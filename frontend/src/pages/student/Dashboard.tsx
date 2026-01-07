import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, List, Tag, Button, Empty } from 'antd';
import {
    BookOutlined,
    FormOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    RightOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import { getAllCourses } from '../../services/course';
import { Course, Assignment, AssignmentAnswer } from '../../types';
import api from '../../services/api';

const { Title, Text } = Typography;

interface ApiResponse<T> {
    code: number;
    data?: T;
    message?: string;
}

const StudentDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
    const [recentGrades, setRecentGrades] = useState<AssignmentAnswer[]>([]);
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user?.userId) return;

        setLoading(true);
        try {
            // Load all courses
            const coursesData = await getAllCourses();
            setCourses(coursesData);

            // Load student's submissions to find graded ones
            try {
                const answersResponse = await api.get<ApiResponse<AssignmentAnswer[]>>('/answers', {
                    params: { studentId: user.userId }
                });
                if (answersResponse.data.code === 200 && answersResponse.data.data) {
                    const graded = answersResponse.data.data
                        .filter(a => a.answerStatus === 'Graded')
                        .slice(0, 5);
                    setRecentGrades(graded);
                }
            } catch (error) {
                console.error('Failed to load answers:', error);
            }

            // Load assignments from courses
            const allAssignments: Assignment[] = [];
            for (const course of coursesData.slice(0, 5)) {
                try {
                    const response = await api.get<ApiResponse<Assignment[]>>('/assignments', {
                        params: { courseId: course.courseId }
                    });
                    if (response.data.code === 200 && response.data.data) {
                        const assignments = response.data.data.map(a => ({
                            ...a,
                            courseName: course.courseName
                        }));
                        allAssignments.push(...assignments);
                    }
                } catch (error) {
                    console.error('Failed to load assignments:', error);
                }
            }
            setPendingAssignments(allAssignments.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
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

    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>
                欢迎回来，{user?.realName || user?.username || '同学'}
            </Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card
                        hoverable
                        onClick={() => navigate('/student/courses')}
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>可选课程</span>}
                            value={courses.length}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        hoverable
                        onClick={() => navigate('/student/courses')}
                        style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>待完成作业</span>}
                            value={pendingAssignments.length}
                            prefix={<FormOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        hoverable
                        onClick={() => navigate('/student/grades')}
                        style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>已批改成绩</span>}
                            value={recentGrades.length}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Recent Assignments */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title="最近作业"
                        extra={
                            <Button type="link" onClick={() => navigate('/student/courses')}>
                                查看全部 <RightOutlined />
                            </Button>
                        }
                    >
                        {pendingAssignments.length === 0 ? (
                            <Empty description="暂无作业" />
                        ) : (
                            <List
                                dataSource={pendingAssignments}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() => navigate(`/student/assignments/${item.assignmentId}`)}
                                            >
                                                查看
                                            </Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={<FormOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                                            title={item.assignmentTitle}
                                            description={
                                                <div>
                                                    <Tag color="blue">{item.courseName}</Tag>
                                                    <Text type="secondary" style={{ marginLeft: 8 }}>
                                                        <ClockCircleOutlined /> {new Date(item.createdAt || '').toLocaleDateString()}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Col>

                {/* Recent Grades */}
                <Col xs={24} lg={12}>
                    <Card
                        title="最近成绩"
                        extra={
                            <Button type="link" onClick={() => navigate('/student/grades')}>
                                查看全部 <RightOutlined />
                            </Button>
                        }
                    >
                        {recentGrades.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40 }}>
                                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                                <div>
                                    <Text type="secondary">暂无成绩记录</Text>
                                </div>
                            </div>
                        ) : (
                            <List
                                dataSource={recentGrades}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<TrophyOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                                            title={item.assignmentTitle}
                                            description={
                                                <div>
                                                    <Tag color="green">{item.score} 分</Tag>
                                                    <Text type="secondary" style={{ marginLeft: 8 }}>
                                                        {item.feedback || '暂无评语'}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDashboard;
