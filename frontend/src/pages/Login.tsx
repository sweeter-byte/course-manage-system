import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Segmented } from 'antd';
import { LockOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { login, loginBySms, sendSmsCode } from '../services/auth';

const { Title, Text } = Typography;

type LoginMode = '密码登录' | '验证码登录';

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [loginMode, setLoginMode] = useState<LoginMode>('密码登录');
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendCode = async () => {
        try {
            const phoneNumber = form.getFieldValue('phoneNumber');
            if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
                message.error('请输入有效的手机号');
                return;
            }

            setSendingCode(true);
            const success = await sendSmsCode(phoneNumber, 'LOGIN');
            if (success) {
                message.success('验证码已发送，请查看控制台');
                setCountdown(60);
            } else {
                message.error('验证码发送失败');
            }
        } finally {
            setSendingCode(false);
        }
    };

    const onFinish = async (values: { phoneNumber: string; password?: string; code?: string }) => {
        setLoading(true);
        try {
            let user;
            if (loginMode === '密码登录') {
                user = await login({ phoneNumber: values.phoneNumber, password: values.password! });
            } else {
                user = await loginBySms(values.phoneNumber, values.code!);
            }

            if (user) {
                message.success('登录成功');
                if (user.role === 'teacher') {
                    navigate('/teacher/dashboard');
                } else if (user.role === 'officer') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'student') {
                    navigate('/student/dashboard');
                } else {
                    message.warning('未知角色，请联系管理员');
                }
            } else {
                message.error(loginMode === '密码登录' ? '登录失败，请检查手机号和密码' : '登录失败，验证码无效或已过期');
            }
        } catch (error) {
            message.error('登录失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            <Card
                style={{
                    width: 420,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    borderRadius: 16,
                }}
                styles={{ body: { padding: '40px' } }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Title level={2} style={{ marginBottom: 8, color: '#1a1a1a' }}>
                            课程互动管理系统
                        </Title>
                        <Text type="secondary">教师 / 教务员 / 学生</Text>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                        <Segmented
                            options={['密码登录', '验证码登录']}
                            value={loginMode}
                            onChange={(value) => {
                                setLoginMode(value as LoginMode);
                                form.resetFields(['password', 'code']);
                            }}
                        />
                    </div>

                    <Form
                        form={form}
                        name="login"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                    >
                        <Form.Item
                            name="phoneNumber"
                            rules={[
                                { required: true, message: '请输入手机号' },
                                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                            ]}
                        >
                            <Input
                                prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="手机号"
                            />
                        </Form.Item>

                        {loginMode === '密码登录' ? (
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: '请输入密码' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                    placeholder="密码"
                                />
                            </Form.Item>
                        ) : (
                            <Form.Item
                                name="code"
                                rules={[
                                    { required: true, message: '请输入验证码' },
                                    { len: 6, message: '验证码为6位数字' }
                                ]}
                            >
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />}
                                        placeholder="验证码"
                                        maxLength={6}
                                        style={{ flex: 1 }}
                                    />
                                    <Button
                                        onClick={handleSendCode}
                                        loading={sendingCode}
                                        disabled={countdown > 0}
                                        style={{ minWidth: 110 }}
                                    >
                                        {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
                                    </Button>
                                </Space.Compact>
                            </Form.Item>
                        )}

                        <Form.Item style={{ marginBottom: 12 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                style={{
                                    height: 48,
                                    fontSize: 16,
                                    borderRadius: 8,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                }}
                            >
                                登录
                            </Button>
                        </Form.Item>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Link to="/forgot-password">
                                <Text type="secondary" style={{ fontSize: 13 }}>忘记密码？</Text>
                            </Link>
                            <Link to="/register">
                                <Text type="secondary" style={{ fontSize: 13 }}>没有账号？立即注册</Text>
                            </Link>
                        </div>
                    </Form>
                </Space>
            </Card>
        </div>
    );
};

export default Login;
