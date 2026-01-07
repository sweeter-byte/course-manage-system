import React, { useEffect, useState } from 'react';
import {
    Table, Card, Button, Tag, Modal, List, Avatar,
    Space, Typography, message, Spin
} from 'antd';
import {
    PlusOutlined, TeamOutlined, BookOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import { getCoursesByTeacher, getCourseStudents } from '../../services/course';
import { getAssignmentsByCourse } from '../../services/assignment';
import { Course, Assignment } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CourseManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [courseAssignments, setCourseAssignments] = useState<Record<string, Assignment[]>>({});
    const [studentsModalVisible, setStudentsModalVisible] = useState(false);
    const [assignmentsModalVisible, setAssignmentsModalVisible] = useState(false);
    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user?.userId) return;

        setLoading(true);
        try {
            const coursesData = await getCoursesByTeacher(user.userId);
            setCourses(coursesData);

            // Load assignments for each course
            const assignmentsMap: Record<string, Assignment[]> = {};
            for (const course of coursesData) {
                const assignments = await getAssignmentsByCourse(course.courseId);
                assignmentsMap[course.courseId] = assignments;
            }
            setCourseAssignments(assignmentsMap);
        } catch (error) {
            console.error('Failed to load data:', error);
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const showStudents = async (course: Course) => {
        setCurrentCourse(course);
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

    const showAssignments = (course: Course) => {
        setCurrentCourse(course);
        setAssignmentsModalVisible(true);
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
            render: (name: string, _record: Course) => (
                <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <span>{name}</span>
                </Space>
            ),
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
            render: (location: string) => location || '-',
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
            title: '作业数',
            key: 'assignmentCount',
            render: (_: any, record: Course) => courseAssignments[record.courseId]?.length || 0,
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
                        查看学生
                    </Button>
                    <Button
                        type="link"
                        onClick={() => showAssignments(record)}
                    >
                        作业列表
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate(`/ teacher / courses / ${record.courseId} /assignments/new`)}
                    >
                        发布作业
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
            <Title level={4} style={{ marginBottom: 24 }}>课程管理</Title>

            <Card>
                <Table
                    columns={columns}
                    dataSource={courses}
                    rowKey="courseId"
                    pagination={{ pageSize: 10 }}
                    expandable={{
                        expandedRowRender: (record: Course) => (
                            <div style={{ padding: '16px 0' }}>
                                <p style={{ margin: 0 }}>
                                    <strong>课程简介：</strong>
                                    {record.courseDescription || '暂无简介'}
                                </p>
                                <p style={{ margin: '8px 0 0' }}>
                                    <CalendarOutlined style={{ marginRight: 8 }} />
                                    <strong>课程时间：</strong>
                                    {record.courseStartDate ? dayjs(record.courseStartDate).format('YYYY-MM-DD') : '-'}
                                    {' 至 '}
                                    {record.courseEndDate ? dayjs(record.courseEndDate).format('YYYY-MM-DD') : '-'}
                                </p>
                            </div>
                        ),
                    }}
                />
            </Card>

            {/* Students Modal */}
            <Modal
                title={`${currentCourse?.courseName} - 学生列表`}
                open={studentsModalVisible}
                onCancel={() => setStudentsModalVisible(false)}
                footer={null}
                width={600}
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
                    <List
                        dataSource={students}
                        renderItem={(student: any) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar icon={<TeamOutlined />} />}
                                    title={student.realName || student.username}
                                    description={
                                        <Space>
                                            <span>学号: {student.studentId || '-'}</span>
                                            <span>|</span>
                                            <span>学院: {student.college || '-'}</span>
                                            <span>|</span>
                                            <span>班级: {student.className || '-'}</span>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Modal>

            {/* Assignments Modal */}
            <Modal
                title={`${currentCourse?.courseName} - 作业列表`}
                open={assignmentsModalVisible}
                onCancel={() => setAssignmentsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setAssignmentsModalVisible(false)}>
                        关闭
                    </Button>,
                    <Button
                        key="new"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setAssignmentsModalVisible(false);
                            if (currentCourse) {
                                navigate(`/ teacher / courses / ${currentCourse.courseId} /assignments/new`);
                            }
                        }}
                    >
                        发布新作业
                    </Button>
                ]}
                width={700}
            >
                {currentCourse && (
                    <List
                        dataSource={courseAssignments[currentCourse.courseId] || []}
                        locale={{ emptyText: '暂无作业' }}
                        renderItem={(assignment: Assignment) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={assignment.assignmentTitle}
                                    description={
                                        <div>
                                            <p style={{ margin: '4px 0' }}>{assignment.assignmentContent?.substring(0, 100)}...</p>
                                            <Space>
                                                {getStatusTag(assignment.assignmentStatus)}
                                                <Text type="secondary">
                                                    截止时间: {assignment.endTime ? dayjs(assignment.endTime).format('YYYY-MM-DD HH:mm') : '-'}
                                                </Text>
                                            </Space>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Modal>
        </div>
    );
};

export default CourseManagement;
