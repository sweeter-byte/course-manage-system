import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message, Avatar, Descriptions, Divider } from 'antd';
import { UserOutlined, SaveOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { getCurrentUser } from '../../services/auth';
import api from '../../services/api';

const { Title, Text } = Typography;

interface ApiResponse<T> {
    code: number;
    data?: T;
    message?: string;
}

const StudentProfile: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const user = getCurrentUser();

    const handleSubmit = async (values: { realName?: string; password?: string }) => {
        if (!user?.userId) {
            message.error('用户信息获取失败');
            return;
        }

        setLoading(true);
        try {
            const updateData: Record<string, string> = {
                userId: user.userId
            };

            if (values.realName) {
                updateData.realName = values.realName;
            }
            if (values.password) {
                updateData.password = values.password;
            }

            const response = await api.post<ApiResponse<unknown>>('/users/update', updateData);

            if (response.data.code === 200) {
                message.success('资料更新成功！');
                // Update local storage if realName changed
                if (values.realName) {
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const userData = JSON.parse(storedUser);
                        userData.realName = values.realName;
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                }
                form.resetFields(['password', 'confirmPassword']);
            } else {
                message.error(response.data.message || '更新失败');
            }
        } catch (error) {
            console.error('Update error:', error);
            message.error('更新失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const getGradientByRole = (role: string) => {
        switch (role) {
            case 'student':
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            case 'teacher':
                return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            case 'officer':
                return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            default:
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'student':
                return '学生';
            case 'teacher':
                return '教师';
            case 'officer':
                return '教务员';
            default:
                return role;
        }
    };

    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>个人资料</Title>

            {/* Profile Header */}
            <Card
                style={{
                    marginBottom: 24,
                    background: getGradientByRole(user?.role || 'student'),
                    borderRadius: 12
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <Avatar
                        size={80}
                        icon={<UserOutlined />}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: '3px solid rgba(255,255,255,0.5)'
                        }}
                    />
                    <div>
                        <Title level={3} style={{ color: '#fff', margin: 0 }}>
                            {user?.realName || user?.username || '用户'}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
                            {getRoleLabel(user?.role || '')}
                        </Text>
                    </div>
                </div>
            </Card>

            {/* Current Info */}
            <Card title="基本信息" style={{ marginBottom: 24 }}>
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
                    <Descriptions.Item label={<><IdcardOutlined /> 用户ID</>}>
                        {user?.userId || '未知'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><UserOutlined /> 用户名</>}>
                        {user?.username || '未知'}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined /> 手机号</>}>
                        {user?.phoneNumber || '未绑定'}
                    </Descriptions.Item>
                    <Descriptions.Item label="真实姓名">
                        {user?.realName || '未设置'}
                    </Descriptions.Item>
                    <Descriptions.Item label="角色">
                        {getRoleLabel(user?.role || '')}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Edit Form */}
            <Card title="修改资料">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        realName: user?.realName || ''
                    }}
                    style={{ maxWidth: 500 }}
                >
                    <Form.Item
                        name="realName"
                        label="真实姓名"
                        rules={[
                            { max: 50, message: '姓名不能超过50个字符' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="请输入真实姓名"
                        />
                    </Form.Item>

                    <Divider>修改密码（可选）</Divider>

                    <Form.Item
                        name="password"
                        label="新密码"
                        rules={[
                            { min: 6, message: '密码至少6个字符' }
                        ]}
                    >
                        <Input.Password
                            placeholder="留空则不修改密码"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认新密码"
                        dependencies={['password']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="请再次输入新密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SaveOutlined />}
                            size="large"
                        >
                            保存修改
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default StudentProfile;
