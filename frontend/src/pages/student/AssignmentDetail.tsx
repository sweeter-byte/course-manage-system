import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, Button, Input, message, Descriptions, Divider, Tag, Alert } from 'antd';
import {
    FormOutlined,
    SendOutlined,
    ArrowLeftOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import { Assignment, AssignmentAnswer } from '../../types';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ApiResponse<T> {
    code: number;
    data?: T;
    message?: string;
}

const StudentAssignmentDetail: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [existingAnswer, setExistingAnswer] = useState<AssignmentAnswer | null>(null);
    const [answerContent, setAnswerContent] = useState('');
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        if (assignmentId) {
            loadData();
        }
    }, [assignmentId]);

    const loadData = async () => {
        if (!assignmentId || !user?.userId) return;

        setLoading(true);
        try {
            // Load assignment details
            const assignmentResponse = await api.get<ApiResponse<Assignment>>(`/assignments/${assignmentId}`);
            if (assignmentResponse.data.code === 200 && assignmentResponse.data.data) {
                setAssignment(assignmentResponse.data.data);
            }

            // Check for existing submission
            try {
                const answersResponse = await api.get<ApiResponse<AssignmentAnswer[]>>('/answers', {
                    params: { assignmentId, studentId: user.userId }
                });
                if (answersResponse.data.code === 200 && answersResponse.data.data?.length) {
                    const myAnswer = answersResponse.data.data.find(a => a.studentId === user.userId);
                    if (myAnswer) {
                        setExistingAnswer(myAnswer);
                        setAnswerContent(myAnswer.answerContent || '');
                    }
                }
            } catch (error) {
                console.error('Failed to check existing answer:', error);
            }
        } catch (error) {
            console.error('Failed to load assignment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!answerContent.trim()) {
            message.warning('请输入您的答案');
            return;
        }

        if (!user?.userId || !assignmentId) {
            message.error('用户信息获取失败，请重新登录');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post<ApiResponse<AssignmentAnswer>>('/answers', {
                assignmentId,
                studentId: user.userId,
                answerContent: answerContent.trim()
            });

            if (response.data.code === 200) {
                message.success('提交成功！');
                loadData(); // Reload to show submitted answer
            } else {
                message.error(response.data.message || '提交失败');
            }
        } catch (error) {
            console.error('Submit error:', error);
            message.error('提交失败，请稍后重试');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!assignment) {
        return <Empty description="作业不存在" />;
    }

    const isGraded = existingAnswer?.answerStatus === 'Graded';
    const isSubmitted = existingAnswer?.answerStatus === 'Submitted';

    return (
        <div>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16 }}
            >
                返回
            </Button>

            {/* Assignment Header */}
            <Card
                style={{
                    marginBottom: 24,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: 12
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <FormOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />
                    <div>
                        <Title level={3} style={{ color: '#fff', margin: 0 }}>
                            {assignment.assignmentTitle}
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                            <ClockCircleOutlined /> 发布于 {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : '未知'}
                        </Text>
                    </div>
                </div>
            </Card>

            {/* Status Alert */}
            {isGraded && (
                <Alert
                    message="作业已批改"
                    description={`得分：${existingAnswer?.score} 分 ${existingAnswer?.feedback ? `- ${existingAnswer.feedback}` : ''}`}
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                    style={{ marginBottom: 24 }}
                />
            )}
            {isSubmitted && (
                <Alert
                    message="作业已提交，等待批改"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Assignment Content */}
            <Card title="作业内容" style={{ marginBottom: 24 }}>
                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {assignment.assignmentContent || '暂无作业内容'}
                </Paragraph>
            </Card>

            {/* Submission Area */}
            <Card
                title={existingAnswer ? "我的答案" : "提交答案"}
                extra={
                    existingAnswer && (
                        <Tag color={isGraded ? 'green' : 'blue'}>
                            {isGraded ? '已批改' : '待批改'}
                        </Tag>
                    )
                }
            >
                {isGraded ? (
                    <div>
                        <Descriptions column={1} style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="得分">
                                <Text strong style={{ fontSize: 24, color: '#52c41a' }}>
                                    {existingAnswer?.score} 分
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="教师评语">
                                {existingAnswer?.feedback || '暂无评语'}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Title level={5}>我的提交：</Title>
                        <Paragraph style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                            {existingAnswer?.answerContent}
                        </Paragraph>
                    </div>
                ) : isSubmitted ? (
                    <div>
                        <Title level={5}>已提交的答案：</Title>
                        <Paragraph style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
                            {existingAnswer?.answerContent}
                        </Paragraph>
                        <Text type="secondary">作业正在等待教师批改...</Text>
                    </div>
                ) : (
                    <div>
                        <TextArea
                            rows={8}
                            placeholder="请输入您的答案..."
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            style={{ marginBottom: 16 }}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            loading={submitting}
                            onClick={handleSubmit}
                            size="large"
                        >
                            提交答案
                        </Button>
                    </div>
                )}
            </Card>

            {/* Q&A Link */}
            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Button
                    type="link"
                    onClick={() => navigate(`/student/feedback?assignmentId=${assignmentId}`)}
                >
                    对这道作业有疑问？前往问答中心
                </Button>
            </div>
        </div>
    );
};

export default StudentAssignmentDetail;
