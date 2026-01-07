import React, { useEffect, useState } from 'react';
import {
    Table, Card, Button, Tag, Modal, Form, Input, InputNumber,
    message, Space, Typography, Select, Spin
} from 'antd';
import { CheckOutlined, EyeOutlined } from '@ant-design/icons';
import { getCurrentUser } from '../../services/auth';
import { getCoursesByTeacher } from '../../services/course';
import { getAssignmentsByCourse, getAnswersByAssignment, gradeAnswer } from '../../services/assignment';
import { Course, AssignmentAnswer } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface AnswerWithDetails extends AssignmentAnswer {
    courseName?: string;
    courseId?: string;
}

const GradingCenter: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<AnswerWithDetails[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [filterCourse, setFilterCourse] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState<AnswerWithDetails | null>(null);
    const [grading, setGrading] = useState(false);
    const [form] = Form.useForm();
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

            const allAnswers: AnswerWithDetails[] = [];

            for (const course of coursesData) {
                const assignments = await getAssignmentsByCourse(course.courseId);

                for (const assignment of assignments) {
                    const answerList = await getAnswersByAssignment(assignment.assignmentId);
                    answerList.forEach(a => {
                        allAnswers.push({
                            ...a,
                            assignmentTitle: assignment.assignmentTitle,
                            courseName: course.courseName,
                            courseId: course.courseId,
                        });
                    });
                }
            }

            setAnswers(allAnswers);
        } catch (error) {
            console.error('Failed to load data:', error);
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = (answer: AnswerWithDetails) => {
        setCurrentAnswer(answer);
        form.setFieldsValue({
            score: answer.score,
            feedback: answer.teacherFeedback,
        });
        setModalVisible(true);
    };

    const handleView = (answer: AnswerWithDetails) => {
        setCurrentAnswer(answer);
        setViewModalVisible(true);
    };

    const onFinishGrade = async (values: { score: number; feedback: string }) => {
        if (!currentAnswer) return;

        setGrading(true);
        try {
            const result = await gradeAnswer({
                answerId: currentAnswer.answerId,
                score: values.score,
                feedback: values.feedback,
            });

            if (result) {
                message.success('批改成功');
                setModalVisible(false);
                loadData(); // Refresh data
            } else {
                message.error('批改失败');
            }
        } catch (error) {
            message.error('批改失败');
        } finally {
            setGrading(false);
        }
    };

    const getStatusTag = (status?: string) => {
        switch (status) {
            case 'Submitted':
                return <Tag color="orange">待批改</Tag>;
            case 'Graded':
                return <Tag color="green">已批改</Tag>;
            case 'NotSubmitted':
                return <Tag color="default">未提交</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const filteredAnswers = answers.filter(a => {
        if (filterCourse !== 'all' && a.courseId !== filterCourse) return false;
        if (filterStatus !== 'all' && a.answerStatus !== filterStatus) return false;
        // Only show submitted and graded answers
        if (a.answerStatus === 'NotSubmitted') return false;
        return true;
    });

    const columns = [
        {
            title: '作业标题',
            dataIndex: 'assignmentTitle',
            key: 'assignmentTitle',
        },
        {
            title: '课程',
            dataIndex: 'courseName',
            key: 'courseName',
        },
        {
            title: '学生ID',
            dataIndex: 'studentId',
            key: 'studentId',
        },
        {
            title: '提交时间',
            dataIndex: 'submissionTime',
            key: 'submissionTime',
            render: (time: string) => time ? new Date(time).toLocaleString() : '-',
        },
        {
            title: '状态',
            dataIndex: 'answerStatus',
            key: 'answerStatus',
            render: (status: string) => getStatusTag(status),
        },
        {
            title: '分数',
            dataIndex: 'score',
            key: 'score',
            render: (score: number) => score !== null && score !== undefined ? score : '-',
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: AnswerWithDetails) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        查看
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleGrade(record)}
                    >
                        {record.answerStatus === 'Graded' ? '重新批改' : '批改'}
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
            <Title level={4} style={{ marginBottom: 24 }}>作业批改中心</Title>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Space size="large">
                    <div>
                        <Text style={{ marginRight: 8 }}>课程筛选：</Text>
                        <Select
                            value={filterCourse}
                            onChange={setFilterCourse}
                            style={{ width: 200 }}
                        >
                            <Option value="all">全部课程</Option>
                            {courses.map(course => (
                                <Option key={course.courseId} value={course.courseId}>
                                    {course.courseName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Text style={{ marginRight: 8 }}>状态筛选：</Text>
                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: 150 }}
                        >
                            <Option value="all">全部</Option>
                            <Option value="Submitted">待批改</Option>
                            <Option value="Graded">已批改</Option>
                        </Select>
                    </div>
                </Space>
            </Card>

            {/* Answers Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredAnswers}
                    rowKey="answerId"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* View Modal */}
            <Modal
                title="查看作业提交"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        关闭
                    </Button>,
                    <Button
                        key="grade"
                        type="primary"
                        onClick={() => {
                            setViewModalVisible(false);
                            if (currentAnswer) handleGrade(currentAnswer);
                        }}
                    >
                        去批改
                    </Button>
                ]}
                width={700}
            >
                {currentAnswer && (
                    <div>
                        <p><strong>作业：</strong>{currentAnswer.assignmentTitle}</p>
                        <p><strong>课程：</strong>{currentAnswer.courseName}</p>
                        <p><strong>学生ID：</strong>{currentAnswer.studentId}</p>
                        <p><strong>提交时间：</strong>{new Date(currentAnswer.submissionTime || '').toLocaleString()}</p>
                        <p><strong>状态：</strong>{getStatusTag(currentAnswer.answerStatus)}</p>
                        <div style={{ marginTop: 16 }}>
                            <p><strong>作业内容：</strong></p>
                            <div style={{
                                background: '#f5f5f5',
                                padding: 16,
                                borderRadius: 8,
                                whiteSpace: 'pre-wrap',
                                maxHeight: 300,
                                overflow: 'auto'
                            }}>
                                {currentAnswer.answerContent || '无内容'}
                            </div>
                        </div>
                        {currentAnswer.answerStatus === 'Graded' && (
                            <div style={{ marginTop: 16 }}>
                                <p><strong>分数：</strong>{currentAnswer.score}</p>
                                <p><strong>评语：</strong>{currentAnswer.teacherFeedback || '无'}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Grade Modal */}
            <Modal
                title="批改作业"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                {currentAnswer && (
                    <div>
                        <p><strong>作业：</strong>{currentAnswer.assignmentTitle}</p>
                        <p><strong>学生ID：</strong>{currentAnswer.studentId}</p>
                        <div style={{ marginBottom: 16 }}>
                            <p><strong>作业内容：</strong></p>
                            <div style={{
                                background: '#f5f5f5',
                                padding: 16,
                                borderRadius: 8,
                                whiteSpace: 'pre-wrap',
                                maxHeight: 200,
                                overflow: 'auto'
                            }}>
                                {currentAnswer.answerContent || '无内容'}
                            </div>
                        </div>

                        <Form form={form} onFinish={onFinishGrade} layout="vertical">
                            <Form.Item
                                name="score"
                                label="分数"
                                rules={[
                                    { required: true, message: '请输入分数' },
                                    { type: 'number', min: 0, max: 100, message: '分数范围为0-100' }
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    max={100}
                                    style={{ width: '100%' }}
                                    placeholder="请输入分数（0-100）"
                                />
                            </Form.Item>
                            <Form.Item
                                name="feedback"
                                label="评语"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="请输入评语（选填）"
                                />
                            </Form.Item>
                            <Form.Item>
                                <Space>
                                    <Button onClick={() => setModalVisible(false)}>
                                        取消
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={grading}>
                                        提交批改
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default GradingCenter;
