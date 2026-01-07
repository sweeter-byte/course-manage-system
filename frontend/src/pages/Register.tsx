import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Space, Select, Row, Col } from 'antd';
import { LockOutlined, PhoneOutlined, UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { register, sendSmsCode } from '../services/auth';

const { Title, Text } = Typography;
const { Option } = Select;

const Register: React.FC = () => {
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
            const success = await sendSmsCode(phoneNumber, 'REGISTER');
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
        username: string;
        password: string;
        confirmPassword: string;
        code: string;
        role: 'student' | 'teacher';
    }) => {
        if (values.password !== values.confirmPassword) {
            message.error('两次输入的密码不一致');
            return;
        }

        setLoading(true);
        try {
            const success = await register({
                phoneNumber: values.phoneNumber,
                username: values.username,
                password: values.password,
                role: values.role,
                code: values.code,
            });

            if (success) {
                message.success('注册成功，请登录');
                navigate('/login');
            } else {
                message.error('注册失败，验证码无效或手机号已被注册');
            }
        } catch (error) {
            message.error('注册失败，请稍后重试');
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
                    width: 450,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    borderRadius: 16,
                }}
                styles={{ body: { padding: '40px' } }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Title level={2} style={{ marginBottom: 8, color: '#1a1a1a' }}>
                            注册账号
                        </Title>
                        <Text type="secondary">课程互动管理系统</Text>
                    </div>

                    <Form
                        form={form}
                        name="register"
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
                            <Row gutter={8}>
                                <Col flex="auto">
                                    <Input
                                        prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />}
                                        placeholder="验证码"
                                        maxLength={6}
                                    />
                                </Col>
                                <Col>
                                    <Button
                                        onClick={handleSendCode}
                                        loading={sendingCode}
                                        disabled={countdown > 0}
                                        style={{ height: 40, minWidth: 110 }}
                                    >
                                        {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Item>

                        <Form.Item
                            name="username"
                            rules={[
                                { required: true, message: '请输入用户名' },
                                { min: 2, message: '用户名至少2个字符' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="用户名"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: '请输入密码' },
                                { min: 6, message: '密码至少6个字符' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="密码"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            rules={[
                                { required: true, message: '请确认密码' },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="确认密码"
                            />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            rules={[{ required: true, message: '请选择角色' }]}
                        >
                            <Select placeholder="选择角色">
                                <Option value="student">学生</Option>
                                <Option value="teacher">教师</Option>
                            </Select>
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
                                注册
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">
                                已有账号？
                                <Link to="/login" style={{ marginLeft: 4 }}>
                                    立即登录
                                </Link>
                            </Text>
                        </div>
                    </Form>
                </Space>
            </Card>
        </div>
    );
};

export default Register;
