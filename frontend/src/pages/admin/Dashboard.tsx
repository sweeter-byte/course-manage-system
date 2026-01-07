import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import {
    TeamOutlined, BookOutlined, UserOutlined,
    SolutionOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import { getAllCourses } from '../../services/course';
import { getAllUsers } from '../../services/user';
import { Course, User } from '../../types';

const { Title } = Typography;

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [coursesData, usersData] = await Promise.all([
                getAllCourses(),
                getAllUsers()
            ]);
            setCourses(coursesData);
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const studentCount = users.filter(u => u.role === 'student').length;
    const teacherCount = users.filter(u => u.role === 'teacher').length;
    const officerCount = users.filter(u => u.role === 'officer').length;
    const ongoingCourses = courses.filter(c => c.courseStatus === 'Ongoing').length;

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
                管理控制台
            </Title>
            <div style={{ marginBottom: 24 }}>
                <Title level={5} type="secondary">
                    欢迎回来，{currentUser?.realName || currentUser?.username || '管理员'}
                </Title>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        onClick={() => navigate('/admin/courses')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            borderRadius: 12
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>全部课程</span>}
                            value={courses.length}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        onClick={() => navigate('/admin/courses')}
                        style={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: '#fff',
                            borderRadius: 12
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>进行中课程</span>}
                            value={ongoingCourses}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        onClick={() => navigate('/admin/users')}
                        style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: '#fff',
                            borderRadius: 12
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>全部用户</span>}
                            value={users.length}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        hoverable
                        onClick={() => navigate('/admin/users')}
                        style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: '#fff',
                            borderRadius: 12
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>教师人数</span>}
                            value={teacherCount}
                            prefix={<SolutionOutlined />}
                            valueStyle={{ color: '#fff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* User Distribution */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="用户分布">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic
                                    title="学生"
                                    value={studentCount}
                                    prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="教师"
                                    value={teacherCount}
                                    prefix={<SolutionOutlined style={{ color: '#52c41a' }} />}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="教务员"
                                    value={officerCount}
                                    prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="课程状态分布">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic
                                    title="未开始"
                                    value={courses.filter(c => c.courseStatus === 'NotStarted').length}
                                    valueStyle={{ color: '#8c8c8c' }}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="进行中"
                                    value={ongoingCourses}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="已结束"
                                    value={courses.filter(c => c.courseStatus === 'Ended').length}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
