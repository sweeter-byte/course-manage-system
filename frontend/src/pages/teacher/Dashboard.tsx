import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, List, Tag, Button, Space } from 'antd';
import {
    BookOutlined,
    FormOutlined,
    CommentOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import { getCoursesByTeacher } from '../../services/course';
import { getAssignmentsByCourse, getAnswersByAssignment } from '../../services/assignment';
import { Course, Assignment, AssignmentAnswer } from '../../types';

const { Title, Text } = Typography;

const TeacherDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [pendingAnswers, setPendingAnswers] = useState<AssignmentAnswer[]>([]);
    const [totalAssignments, setTotalAssignments] = useState(0);
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user?.userId) return;

        setLoading(true);
        try {
            // Load courses
            const coursesData = await getCoursesByTeacher(user.userId);
            setCourses(coursesData);

            // Load assignments and pending answers
            let allAssignments: Assignment[] = [];
            let allPendingAnswers: AssignmentAnswer[] = [];

            for (const course of coursesData) {
                const assignments = await getAssignmentsByCourse(course.courseId);
                allAssignments = [...allAssignments, ...assignments];

                for (const assignment of assignments) {
                    const answers = await getAnswersByAssignment(assignment.assignmentId);
                    const pending = answers.filter(a => a.answerStatus === 'Submitted');
                    pending.forEach(a => {
                        a.assignmentTitle = assignment.assignmentTitle;
                        a.courseName = course.courseName;
                    });
                    allPendingAnswers = [...allPendingAnswers, ...pending];
                }
            }

            setTotalAssignments(allAssignments.length);
            setPendingAnswers(allPendingAnswers.slice(0, 5)); // Show only first 5
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
                欢迎回来，{user?.realName || user?.username || '老师'}
            </Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card
                        hoverable
                        onClick={() => navigate('/teacher/courses')}
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>我的课程</span>}
                            value={courses.length}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        hoverable
                        onClick={() => navigate('/teacher/grading')}
                        style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>待批改作业</span>}
                            value={pendingAnswers.length}
                            prefix={<FormOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        hoverable
                        onClick={() => navigate('/teacher/feedback')}
                        style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>已发布作业</span>}
                            value={totalAssignments}
                            prefix={<CommentOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Pending Assignments */}
            <Card
                title="待批改作业"
                extra={
                    <Button type="link" onClick={() => navigate('/teacher/grading')}>
                        查看全部 <RightOutlined />
                    </Button>
                }
            >
                {pendingAnswers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                        <div>
                            <Text type="secondary">暂无待批改的作业</Text>
                        </div>
                    </div>
                ) : (
                    <List
                        dataSource={pendingAnswers}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={() => navigate('/teacher/grading')}
                                    >
                                        去批改
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<FormOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                                    title={item.assignmentTitle}
                                    description={
                                        <Space>
                                            <Tag color="blue">{item.courseName}</Tag>
                                            <Text type="secondary">
                                                <ClockCircleOutlined /> {new Date(item.submissionTime || '').toLocaleString()}
                                            </Text>
                                        </Space>
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

export default TeacherDashboard;
