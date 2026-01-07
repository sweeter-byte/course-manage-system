import React, { useEffect, useState } from 'react';
import {
    Card, List, Typography, Spin, Select, Space,
    Input, Button, message, Collapse, Tag, Empty, Avatar
} from 'antd';
import {
    UserOutlined, SendOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { getCurrentUser } from '../../services/auth';
import { getCoursesByTeacher } from '../../services/course';
import { getAssignmentsByCourse } from '../../services/assignment';
import { getFeedbacksByAssignment, getResponsesByFeedback, createResponse } from '../../services/feedback';
import { Course, Feedback, Response } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface FeedbackWithResponses extends Feedback {
    responses: Response[];
    courseName?: string;
    assignmentTitle?: string;
}

const FeedbackBoard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState<FeedbackWithResponses[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [filterCourse, setFilterCourse] = useState<string>('all');
    const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
    const [replying, setReplying] = useState<Record<string, boolean>>({});
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

            const allFeedbacks: FeedbackWithResponses[] = [];

            for (const course of coursesData) {
                const assignments = await getAssignmentsByCourse(course.courseId);

                for (const assignment of assignments) {
                    const feedbackList = await getFeedbacksByAssignment(assignment.assignmentId);

                    for (const feedback of feedbackList) {
                        const responses = await getResponsesByFeedback(feedback.feedbackId);
                        allFeedbacks.push({
                            ...feedback,
                            responses,
                            courseName: course.courseName,
                            assignmentTitle: assignment.assignmentTitle,
                        });
                    }
                }
            }

            // Sort by publish time, newest first
            allFeedbacks.sort((a, b) => {
                const timeA = new Date(a.publishTime || 0).getTime();
                const timeB = new Date(b.publishTime || 0).getTime();
                return timeB - timeA;
            });

            setFeedbacks(allFeedbacks);
        } catch (error) {
            console.error('Failed to load data:', error);
            message.error('加载数据失败');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (feedbackId: string) => {
        const content = replyTexts[feedbackId]?.trim();
        if (!content) {
            message.warning('请输入回复内容');
            return;
        }

        if (!user?.userId) return;

        setReplying({ ...replying, [feedbackId]: true });
        try {
            const result = await createResponse(feedbackId, user.userId, content);
            if (result) {
                message.success('回复成功');
                setReplyTexts({ ...replyTexts, [feedbackId]: '' });
                loadData(); // Refresh data
            } else {
                message.error('回复失败');
            }
        } catch (error) {
            message.error('回复失败');
        } finally {
            setReplying({ ...replying, [feedbackId]: false });
        }
    };

    const filteredFeedbacks = filterCourse === 'all'
        ? feedbacks
        : feedbacks.filter(f => {
            const course = courses.find(c => c.courseName === f.courseName);
            return course?.courseId === filterCourse;
        });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>答疑看板</Title>

            {/* Filter */}
            <Card style={{ marginBottom: 16 }}>
                <Space>
                    <Text>课程筛选：</Text>
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
                </Space>
            </Card>

            {/* Feedback List */}
            {filteredFeedbacks.length === 0 ? (
                <Card>
                    <Empty
                        description="暂无学生提问"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            ) : (
                <List
                    dataSource={filteredFeedbacks}
                    renderItem={(feedback) => (
                        <Card style={{ marginBottom: 16 }}>
                            {/* Feedback Header */}
                            <div style={{ marginBottom: 16 }}>
                                <Space style={{ marginBottom: 8 }}>
                                    <Tag color="blue">{feedback.courseName}</Tag>
                                    <Tag>{feedback.assignmentTitle}</Tag>
                                    {feedback.responses.length > 0 && (
                                        <Tag color="green" icon={<CheckCircleOutlined />}>
                                            已回复
                                        </Tag>
                                    )}
                                </Space>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <Avatar icon={<UserOutlined />} />
                                    <div style={{ flex: 1 }}>
                                        <div>
                                            <Text strong>学生 {feedback.studentId}</Text>
                                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                                {new Date(feedback.publishTime || '').toLocaleString()}
                                            </Text>
                                        </div>
                                        <div style={{
                                            marginTop: 8,
                                            padding: 12,
                                            background: '#f5f5f5',
                                            borderRadius: 8,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {feedback.feedbackContent}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Responses */}
                            {feedback.responses.length > 0 && (
                                <Collapse ghost style={{ marginBottom: 16 }}>
                                    <Panel
                                        header={`查看回复 (${feedback.responses.length})`}
                                        key="1"
                                    >
                                        {feedback.responses.map((response, index) => (
                                            <div
                                                key={response.responseId}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 12,
                                                    marginBottom: index < feedback.responses.length - 1 ? 16 : 0
                                                }}
                                            >
                                                <Avatar style={{ background: '#1890ff' }} icon={<UserOutlined />} />
                                                <div style={{ flex: 1 }}>
                                                    <div>
                                                        <Text strong style={{ color: '#1890ff' }}>教师回复</Text>
                                                        <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                                            {new Date(response.publishTime || '').toLocaleString()}
                                                        </Text>
                                                    </div>
                                                    <div style={{
                                                        marginTop: 8,
                                                        padding: 12,
                                                        background: '#e6f7ff',
                                                        borderRadius: 8,
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {response.responseContent}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </Panel>
                                </Collapse>
                            )}

                            {/* Reply Input */}
                            <div style={{ display: 'flex', gap: 12 }}>
                                <TextArea
                                    placeholder="输入回复内容..."
                                    value={replyTexts[feedback.feedbackId] || ''}
                                    onChange={(e) => setReplyTexts({
                                        ...replyTexts,
                                        [feedback.feedbackId]: e.target.value
                                    })}
                                    autoSize={{ minRows: 2, maxRows: 4 }}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={() => handleReply(feedback.feedbackId)}
                                    loading={replying[feedback.feedbackId]}
                                >
                                    回复
                                </Button>
                            </div>
                        </Card>
                    )}
                />
            )}
        </div>
    );
};

export default FeedbackBoard;
