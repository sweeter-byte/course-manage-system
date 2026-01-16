import React, { useState } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Space, Typography } from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    FormOutlined,
    CommentOutlined,
    TeamOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    FolderOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = getCurrentUser();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Menu items based on user role
    const getMenuItems = () => {
        if (user?.role === 'teacher') {
            return [
                {
                    key: '/teacher/dashboard',
                    icon: <DashboardOutlined />,
                    label: '控制台',
                },
                {
                    key: '/teacher/grading',
                    icon: <FormOutlined />,
                    label: '作业批改',
                },
                {
                    key: '/teacher/courses',
                    icon: <BookOutlined />,
                    label: '课程管理',
                },
                {
                    key: '/teacher/resources',
                    icon: <FolderOutlined />,
                    label: '课程资源',
                },
                {
                    key: '/teacher/feedback',
                    icon: <CommentOutlined />,
                    label: '答疑看板',
                },
            ];
        } else if (user?.role === 'officer') {
            return [
                {
                    key: '/admin/dashboard',
                    icon: <DashboardOutlined />,
                    label: '控制台',
                },
                {
                    key: '/admin/courses',
                    icon: <BookOutlined />,
                    label: '课程管理',
                },
                {
                    key: '/admin/users',
                    icon: <TeamOutlined />,
                    label: '人员管理',
                },
            ];
        } else if (user?.role === 'student') {
            return [
                {
                    key: '/student/dashboard',
                    icon: <DashboardOutlined />,
                    label: '控制台',
                },
                {
                    key: '/student/courses',
                    icon: <BookOutlined />,
                    label: '我的课程',
                },
                {
                    key: '/student/grades',
                    icon: <FormOutlined />,
                    label: '我的成绩',
                },
                {
                    key: '/student/feedback',
                    icon: <CommentOutlined />,
                    label: '问答中心',
                },
                {
                    key: '/student/profile',
                    icon: <UserOutlined />,
                    label: '个人资料',
                },
            ];
        }
        return [];
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人信息',
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: collapsed ? 14 : 18,
                    fontWeight: 'bold',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {collapsed ? 'CMS' : '课程管理系统'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={getMenuItems()}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>
            <Layout>
                <Header style={{
                    padding: '0 24px',
                    background: colorBgContainer,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            style: { fontSize: 18, cursor: 'pointer' },
                            onClick: () => setCollapsed(!collapsed),
                        })}
                    </div>
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar icon={<UserOutlined />} />
                            <Text>{user?.realName || user?.username || '用户'}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                ({user?.role === 'teacher' ? '教师' : user?.role === 'officer' ? '教务员' : '学生'})
                            </Text>
                        </Space>
                    </Dropdown>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
