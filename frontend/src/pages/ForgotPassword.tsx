import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Space } from 'antd';
import { LockOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword, sendSmsCode } from '../services/auth';

const { Title, Text } = Typography;

const ForgotPassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);
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
            const success = await sendSmsCode(phoneNumber, 'RESET_PASSWORD');
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

    const onFinish = async (values: {
        phoneNumber: string;
        code: string;
        newPassword: string;
        confirmPassword: string;
    }) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('两次输入的密码不一致');
            return;
        }

        setLoading(true);
        try {
            const success = await resetPassword(values.phoneNumber, values.code, values.newPassword);
            if (success) {
                message.success('密码重置成功，请登录');
                navigate('/login');
            } else {
                message.error('密码重置失败，验证码无效或手机号未注册');
            }
        } catch (error) {
            message.error('密码重置失败，请稍后重试');
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
                            找回密码
                        </Title>
                        <Text type="secondary">通过手机验证码重置密码</Text>
                    </div>

                    <Form
                        form={form}
                        name="forgotPassword"
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

                        <Form.Item
                            name="newPassword"
                            rules={[
                                { required: true, message: '请输入新密码' },
                                { min: 6, message: '密码至少6个字符' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="新密码"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            rules={[
                                { required: true, message: '请确认新密码' },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="确认新密码"
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 16 }}>
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
                                重置密码
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Link to="/login">
                                <Text type="secondary">返回登录</Text>
                            </Link>
                        </div>
                    </Form>
                </Space>
            </Card>
        </div>
    );
};

export default ForgotPassword;
