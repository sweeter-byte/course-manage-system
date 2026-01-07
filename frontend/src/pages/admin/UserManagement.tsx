import React, { useEffect, useState } from 'react';
import {
    Table, Card, Button, Tag, Modal, Form, Input,
    message, Space, Typography, Spin, Select
} from 'antd';
import {
    PlusOutlined, EditOutlined, KeyOutlined,
    UserOutlined, SearchOutlined
} from '@ant-design/icons';
import { getAllUsers, updateUser, createUser, resetPassword } from '../../services/user';
import { User } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const usersData = await getAllUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to load data:', error);
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const showModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue({
                username: user.username,
                realName: user.realName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                teacherId: user.teacherId,
                college: user.college,
                major: user.major,
                className: user.className,
            });
        } else {
            setEditingUser(null);
            form.resetFields();
        }
        setModalVisible(true);
    };

    const showPasswordModal = (userId: string) => {
        setCurrentUserId(userId);
        passwordForm.resetFields();
        setPasswordModalVisible(true);
    };

    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            if (editingUser) {
                const success = await updateUser({
                    ...editingUser,
                    ...values,
                });
                if (success) {
                    message.success('用户信息更新成功');
                    setModalVisible(false);
                    loadData();
                } else {
                    message.error('用户信息更新失败');
                }
            } else {
                // Create new user
                const success = await createUser({
                    ...values,
                    password: values.password || '123456', // Default password
                });
                if (success) {
                    message.success('用户创建成功');
                    setModalVisible(false);
                    loadData();
                } else {
                    message.error('用户创建失败');
                }
            }
        } catch (error) {
            message.error('操作失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (values: { newPassword: string }) => {
        setSubmitting(true);
        try {
            const success = await resetPassword(currentUserId, values.newPassword);
            if (success) {
                message.success('密码重置成功');
                setPasswordModalVisible(false);
            } else {
                message.error('密码重置失败');
            }
        } catch (error) {
            message.error('密码重置失败');
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleTag = (role?: string) => {
        switch (role) {
            case 'student':
                return <Tag color="blue">学生</Tag>;
            case 'teacher':
                return <Tag color="green">教师</Tag>;
            case 'officer':
                return <Tag color="orange">教务员</Tag>;
            default:
                return <Tag>{role}</Tag>;
        }
    };

    const filteredUsers = users.filter(u => {
        if (filterRole !== 'all' && u.role !== filterRole) return false;
        if (searchText) {
            const search = searchText.toLowerCase();
            return (
                u.username?.toLowerCase().includes(search) ||
                u.realName?.toLowerCase().includes(search) ||
                u.phoneNumber?.includes(search) ||
                u.studentId?.toLowerCase().includes(search) ||
                u.teacherId?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            render: (name: string) => (
                <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <span>{name}</span>
                </Space>
            ),
        },
        {
            title: '姓名',
            dataIndex: 'realName',
            key: 'realName',
            render: (name: string) => name || '-',
        },
        {
            title: '手机号',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => getRoleTag(role),
        },
        {
            title: '学号/工号',
            key: 'idNumber',
            render: (_: any, record: User) => record.studentId || record.teacherId || '-',
        },
        {
            title: '学院',
            dataIndex: 'college',
            key: 'college',
            render: (col: string) => col || '-',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: User) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        icon={<KeyOutlined />}
                        onClick={() => showPasswordModal(record.userId)}
                    >
                        重置密码
                    </Button>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>人员管理</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                >
                    添加用户
                </Button>
            </div>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Space size="large">
                    <div>
                        <Text style={{ marginRight: 8 }}>搜索：</Text>
                        <Input
                            placeholder="搜索用户名、姓名、手机号..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 250 }}
                            allowClear
                        />
                    </div>
                    <div>
                        <Text style={{ marginRight: 8 }}>角色筛选：</Text>
                        <Select
                            value={filterRole}
                            onChange={setFilterRole}
                            style={{ width: 150 }}
                        >
                            <Option value="all">全部角色</Option>
                            <Option value="student">学生</Option>
                            <Option value="teacher">教师</Option>
                            <Option value="officer">教务员</Option>
                        </Select>
                    </div>
                </Space>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="userId"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingUser ? '编辑用户' : '添加用户'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="realName"
                        label="姓名"
                    >
                        <Input placeholder="请输入姓名" />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="手机号"
                        rules={[
                            { required: true, message: '请输入手机号' },
                            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                        ]}
                    >
                        <Input placeholder="请输入手机号" disabled={!!editingUser} />
                    </Form.Item>

                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="初始密码"
                            rules={[{ required: true, message: '请输入初始密码' }]}
                        >
                            <Input.Password placeholder="请输入初始密码" />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="email"
                        label="邮箱"
                    >
                        <Input placeholder="请输入邮箱" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色' }]}
                    >
                        <Select placeholder="请选择角色">
                            <Option value="student">学生</Option>
                            <Option value="teacher">教师</Option>
                            <Option value="officer">教务员</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) => prev.role !== curr.role}
                    >
                        {({ getFieldValue }) => {
                            const role = getFieldValue('role');
                            return (
                                <>
                                    {role === 'student' && (
                                        <>
                                            <Form.Item name="studentId" label="学号">
                                                <Input placeholder="请输入学号" />
                                            </Form.Item>
                                            <Form.Item name="className" label="班级">
                                                <Input placeholder="请输入班级" />
                                            </Form.Item>
                                            <Form.Item name="major" label="专业">
                                                <Input placeholder="请输入专业" />
                                            </Form.Item>
                                        </>
                                    )}
                                    {role === 'teacher' && (
                                        <Form.Item name="teacherId" label="工号">
                                            <Input placeholder="请输入工号" />
                                        </Form.Item>
                                    )}
                                </>
                            );
                        }}
                    </Form.Item>

                    <Form.Item name="college" label="学院">
                        <Input placeholder="请输入学院" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                {editingUser ? '保存修改' : '添加用户'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                title="重置密码"
                open={passwordModalVisible}
                onCancel={() => setPasswordModalVisible(false)}
                footer={null}
                width={400}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleResetPassword}
                >
                    <Form.Item
                        name="newPassword"
                        label="新密码"
                        rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 6, message: '密码长度不能少于6位' }
                        ]}
                    >
                        <Input.Password placeholder="请输入新密码" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: '请确认密码' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="请再次输入密码" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button onClick={() => setPasswordModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                重置密码
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
