import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, List, Input, Button, Tag, message, Avatar, Divider } from 'antd';
import {
    CommentOutlined,
    SendOutlined,
    UserOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import { Feedback } from '../../types';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea, Search } = Input;

interface ApiResponse<T> {
    code: number;
    data?: T;
    message?: string;
}

const StudentFeedback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const assignmentIdFromUrl = searchParams.get('assignmentId');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [assignmentId, setAssignmentId] = useState(assignmentIdFromUrl || '');
    const [searchText, setSearchText] = useState('');
    const user = getCurrentUser();

    useEffect(() => {
        loadFeedbacks();
    }, []);

    useEffect(() => {
        if (searchText) {
            const filtered = feedbacks.filter(f =>
                f.feedbackContent?.toLowerCase().includes(searchText.toLowerCase()) ||
                f.replyContent?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredFeedbacks(filtered);
        } else {
            setFilteredFeedbacks(feedbacks);
        }
    }, [searchText, feedbacks]);

    const loadFeedbacks = async () => {
        setLoading(true);
        try {
            // Load all feedbacks (or filtered by assignmentId if provided)
            const params: Record<string, string> = {};
            if (assignmentIdFromUrl) {
                params.assignmentId = assignmentIdFromUrl;
            }

            const response = await api.get<ApiResponse<Feedback[]>>('/feedbacks', { params });
            if (response.data.code === 200 && response.data.data) {
                setFeedbacks(response.data.data);
                setFilteredFeedbacks(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!newQuestion.trim()) {
            message.warning('请输入问题内容');
            return;
        }

        if (!assignmentId.trim()) {
            message.warning('请输入作业ID');
            return;
        }

        if (!user?.userId) {
            message.error('用户信息获取失败，请重新登录');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post<ApiResponse<Feedback>>('/feedbacks', {
                assignmentId: assignmentId.trim(),
                studentId: user.userId,
                feedbackContent: newQuestion.trim()
            });

            if (response.data.code === 200) {
                message.success('问题发布成功！');
                setNewQuestion('');
                loadFeedbacks();
            } else {
                message.error(response.data.message || '发布失败');
            }
        } catch (error) {
            console.error('Submit error:', error);
            message.error('发布失败，请稍后重试');
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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>问答中心</Title>
                <Search
                    placeholder="搜索问题..."
                    allowClear
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* Post New Question */}
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CommentOutlined style={{ color: '#1890ff' }} />
                        <span>发布新问题</span>
                    </div>
                }
                style={{ marginBottom: 24 }}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>作业ID：</Text>
                    <Input
                        placeholder="请输入作业ID"
                        value={assignmentId}
                        onChange={(e) => setAssignmentId(e.target.value)}
                        style={{ marginBottom: 16 }}
                    />
                </div>
                <TextArea
                    rows={4}
                    placeholder="请输入您的问题..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    loading={submitting}
                    onClick={handleSubmit}
                >
                    发布问题
                </Button>
            </Card>

            {/* Questions List */}
            <Card title={`问题列表 (${filteredFeedbacks.length})`}>
                {filteredFeedbacks.length === 0 ? (
                    <Empty description="暂无问题" />
                ) : (
                    <List
                        dataSource={filteredFeedbacks}
                        renderItem={(item) => (
                            <List.Item style={{ display: 'block' }}>
                                <div style={{
                                    background: '#f9f9f9',
                                    padding: 16,
                                    borderRadius: 8,
                                    marginBottom: 8
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text strong>学生提问</Text>
                                                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                                                </Text>
                                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                                    作业: {item.assignmentId}
                                                </Tag>
                                            </div>
                                            <Paragraph style={{ margin: 0 }}>
                                                {item.feedbackContent}
                                            </Paragraph>
                                        </div>
                                    </div>
                                </div>

                                {item.replyContent && (
                                    <div style={{
                                        background: '#e6f7ff',
                                        padding: 16,
                                        borderRadius: 8,
                                        marginLeft: 40
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            <Avatar icon={<UserOutlined />} style={{ background: '#52c41a' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ marginBottom: 8 }}>
                                                    <Text strong style={{ color: '#52c41a' }}>教师回复</Text>
                                                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                                                        {item.repliedAt ? new Date(item.repliedAt).toLocaleString() : ''}
                                                    </Text>
                                                </div>
                                                <Paragraph style={{ margin: 0 }}>
                                                    {item.replyContent}
                                                </Paragraph>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!item.replyContent && (
                                    <div style={{ marginLeft: 40, paddingTop: 8 }}>
                                        <Tag color="orange">等待教师回复</Tag>
                                    </div>
                                )}

                                <Divider style={{ margin: '16px 0 0' }} />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default StudentFeedback;
