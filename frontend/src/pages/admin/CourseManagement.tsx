import React, { useEffect, useState } from 'react';
import {
    Table, Card, Button, Tag, Modal, Form, Input, DatePicker,
    message, Space, Typography, Spin, Select, Popconfirm
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    BookOutlined, TeamOutlined
} from '@ant-design/icons';
import { getAllCourses, createCourse, updateCourse, deleteCourse, getCourseStudents } from '../../services/course';
import { getAllUsers } from '../../services/user';
import { Course, User } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminCourseManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [studentsModalVisible, setStudentsModalVisible] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [currentCourseName, setCurrentCourseName] = useState('');
    const [form] = Form.useForm();

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
            setTeachers(usersData.filter(u => u.role === 'teacher'));
        } catch (error) {
            console.error('Failed to load data:', error);
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const showModal = (course?: Course) => {
        if (course) {
            setEditingCourse(course);
            form.setFieldsValue({
                courseName: course.courseName,
                teacherId: course.teacherId,
                courseDescription: course.courseDescription,
                courseSemester: course.courseSemester,
                courseLocation: course.courseLocation,
                courseStatus: course.courseStatus,
                dateRange: course.courseStartDate && course.courseEndDate
                    ? [dayjs(course.courseStartDate), dayjs(course.courseEndDate)]
                    : undefined,
            });
        } else {
            setEditingCourse(null);
            form.resetFields();
        }
        setModalVisible(true);
    };

    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        try {
            const courseData: Partial<Course> = {
                courseName: values.courseName,
                teacherId: values.teacherId,
                creatorId: values.teacherId,
                courseDescription: values.courseDescription,
                courseSemester: values.courseSemester,
                courseLocation: values.courseLocation,
                courseStatus: values.courseStatus || 'NotStarted',
                courseStartDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
                courseEndDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
            };

            if (editingCourse) {
                const success = await updateCourse(editingCourse.courseId, courseData);
                if (success) {
                    message.success('课程更新成功');
                    setModalVisible(false);
                    loadData();
                } else {
                    message.error('课程更新失败');
                }
            } else {
                const result = await createCourse(courseData);
                if (result) {
                    message.success('课程创建成功');
                    setModalVisible(false);
                    loadData();
                } else {
                    message.error('课程创建失败');
                }
            }
        } catch (error) {
            message.error('操作失败');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (courseId: string) => {
        try {
            const success = await deleteCourse(courseId);
            if (success) {
                message.success('课程删除成功');
                loadData();
            } else {
                message.error('课程删除失败');
            }
        } catch (error) {
            message.error('删除失败');
        }
    };

    const showStudents = async (course: Course) => {
        setCurrentCourseName(course.courseName);
        setStudentsModalVisible(true);
        setLoadingStudents(true);
        try {
            const studentsData = await getCourseStudents(course.courseId);
            setStudents(studentsData);
        } catch (error) {
            message.error('加载学生列表失败');
        } finally {
            setLoadingStudents(false);
        }
    };

    const getStatusTag = (status?: string) => {
        switch (status) {
            case 'NotStarted':
                return <Tag color="default">未开始</Tag>;
            case 'Ongoing':
                return <Tag color="green">进行中</Tag>;
            case 'Ended':
                return <Tag color="red">已结束</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: '课程名称',
            dataIndex: 'courseName',
            key: 'courseName',
            render: (name: string) => (
                <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <span>{name}</span>
                </Space>
            ),
        },
        {
            title: '授课教师',
            dataIndex: 'teacherId',
            key: 'teacherId',
            render: (teacherId: string) => {
                const teacher = teachers.find(t => t.userId === teacherId);
                return teacher?.realName || teacher?.username || teacherId;
            },
        },
        {
            title: '学期',
            dataIndex: 'courseSemester',
            key: 'courseSemester',
        },
        {
            title: '上课地点',
            dataIndex: 'courseLocation',
            key: 'courseLocation',
            render: (loc: string) => loc || '-',
        },
        {
            title: '状态',
            dataIndex: 'courseStatus',
            key: 'courseStatus',
            render: (status: string) => getStatusTag(status),
        },
        {
            title: '选课人数',
            dataIndex: 'enrollmentCount',
            key: 'enrollmentCount',
            render: (count: number) => count || 0,
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: Course) => (
                <Space>
                    <Button
                        type="link"
                        icon={<TeamOutlined />}
                        onClick={() => showStudents(record)}
                    >
                        学生
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这门课程吗？"
                        description="删除后无法恢复，相关作业和选课记录也会受到影响。"
                        onConfirm={() => handleDelete(record.courseId)}
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            删除
                        </Button>
                    </Popconfirm>
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
                <Title level={4} style={{ margin: 0 }}>课程管理</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                >
                    新建课程
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={courses}
                    rowKey="courseId"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingCourse ? '编辑课程' : '新建课程'}
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
                        name="courseName"
                        label="课程名称"
                        rules={[{ required: true, message: '请输入课程名称' }]}
                    >
                        <Input placeholder="请输入课程名称" />
                    </Form.Item>

                    <Form.Item
                        name="teacherId"
                        label="授课教师"
                        rules={[{ required: true, message: '请选择授课教师' }]}
                    >
                        <Select placeholder="请选择授课教师">
                            {teachers.map(teacher => (
                                <Option key={teacher.userId} value={teacher.userId}>
                                    {teacher.realName || teacher.username} ({teacher.teacherId || teacher.userId})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="courseDescription"
                        label="课程简介"
                    >
                        <TextArea rows={3} placeholder="请输入课程简介" />
                    </Form.Item>

                    <Form.Item
                        name="courseSemester"
                        label="学期"
                    >
                        <Input placeholder="例如：2025-2026学年第一学期" />
                    </Form.Item>

                    <Form.Item
                        name="courseLocation"
                        label="上课地点"
                    >
                        <Input placeholder="例如：教学楼A-301" />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="课程时间"
                    >
                        <DatePicker.RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="courseStatus"
                        label="课程状态"
                    >
                        <Select placeholder="请选择课程状态">
                            <Option value="NotStarted">未开始</Option>
                            <Option value="Ongoing">进行中</Option>
                            <Option value="Ended">已结束</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                {editingCourse ? '保存修改' : '创建课程'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Students Modal */}
            <Modal
                title={`${currentCourseName} - 学生列表`}
                open={studentsModalVisible}
                onCancel={() => setStudentsModalVisible(false)}
                footer={null}
                width={700}
            >
                {loadingStudents ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin />
                    </div>
                ) : students.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Text type="secondary">暂无学生选课</Text>
                    </div>
                ) : (
                    <Table
                        dataSource={students}
                        rowKey="userId"
                        columns={[
                            { title: '学号', dataIndex: 'studentId', key: 'studentId' },
                            { title: '姓名', dataIndex: 'realName', key: 'realName' },
                            { title: '学院', dataIndex: 'college', key: 'college' },
                            { title: '班级', dataIndex: 'className', key: 'className' },
                        ]}
                        pagination={false}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AdminCourseManagement;
