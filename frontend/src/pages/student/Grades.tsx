import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, Table, Tag, Input } from 'antd';
import { TrophyOutlined, SearchOutlined } from '@ant-design/icons';
import { getCurrentUser } from '../../services/auth';
import { AssignmentAnswer } from '../../types';
import api from '../../services/api';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

interface ApiResponse<T> {
    code: number;
    data?: T;
    message?: string;
}

const StudentGrades: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<AssignmentAnswer[]>([]);
    const [filteredAnswers, setFilteredAnswers] = useState<AssignmentAnswer[]>([]);
    const [searchText, setSearchText] = useState('');
    const user = getCurrentUser();

    useEffect(() => {
        loadGrades();
    }, []);

    useEffect(() => {
        if (searchText) {
            const filtered = answers.filter(answer =>
                answer.assignmentTitle?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredAnswers(filtered);
        } else {
            setFilteredAnswers(answers);
        }
    }, [searchText, answers]);

    const loadGrades = async () => {
        if (!user?.userId) return;

        setLoading(true);
        try {
            const response = await api.get<ApiResponse<AssignmentAnswer[]>>('/answers', {
                params: { studentId: user.userId }
            });
            if (response.data.code === 200 && response.data.data) {
                setAnswers(response.data.data);
                setFilteredAnswers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load grades:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<AssignmentAnswer> = [
        {
            title: '作业名称',
            dataIndex: 'assignmentTitle',
            key: 'assignmentTitle',
            render: (text) => <Text strong>{text || '未知作业'}</Text>,
        },
        {
            title: '提交时间',
            dataIndex: 'submissionTime',
            key: 'submissionTime',
            render: (text) => text ? new Date(text).toLocaleString() : '未知',
            sorter: (a, b) => new Date(a.submissionTime || 0).getTime() - new Date(b.submissionTime || 0).getTime(),
        },
        {
            title: '状态',
            dataIndex: 'answerStatus',
            key: 'answerStatus',
            render: (status) => (
                <Tag color={status === 'Graded' ? 'green' : status === 'Submitted' ? 'blue' : 'default'}>
                    {status === 'Graded' ? '已批改' : status === 'Submitted' ? '待批改' : status}
                </Tag>
            ),
            filters: [
                { text: '已批改', value: 'Graded' },
                { text: '待批改', value: 'Submitted' },
            ],
            onFilter: (value, record) => record.answerStatus === value,
        },
        {
            title: '得分',
            dataIndex: 'score',
            key: 'score',
            render: (score, record) => {
                if (record.answerStatus !== 'Graded') {
                    return <Text type="secondary">-</Text>;
                }
                return (
                    <Text strong style={{
                        color: score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f',
                        fontSize: 18
                    }}>
                        {score}
                    </Text>
                );
            },
            sorter: (a, b) => (a.score || 0) - (b.score || 0),
        },
        {
            title: '教师评语',
            dataIndex: 'feedback',
            key: 'feedback',
            ellipsis: true,
            render: (text) => text || <Text type="secondary">暂无评语</Text>,
        },
    ];

    // Calculate statistics
    const gradedAnswers = answers.filter(a => a.answerStatus === 'Graded');
    const avgScore = gradedAnswers.length > 0
        ? (gradedAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / gradedAnswers.length).toFixed(1)
        : '0';

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
                <Title level={4} style={{ margin: 0 }}>我的成绩</Title>
                <Search
                    placeholder="搜索作业名称..."
                    allowClear
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* Statistics */}
            <Card style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                        <Text type="secondary">总提交数</Text>
                        <Title level={2} style={{ margin: '8px 0 0' }}>{answers.length}</Title>
                    </div>
                    <div>
                        <Text type="secondary">已批改</Text>
                        <Title level={2} style={{ margin: '8px 0 0', color: '#52c41a' }}>{gradedAnswers.length}</Title>
                    </div>
                    <div>
                        <Text type="secondary">待批改</Text>
                        <Title level={2} style={{ margin: '8px 0 0', color: '#1890ff' }}>
                            {answers.length - gradedAnswers.length}
                        </Title>
                    </div>
                    <div>
                        <Text type="secondary">平均分</Text>
                        <Title level={2} style={{ margin: '8px 0 0', color: '#faad14' }}>
                            <TrophyOutlined style={{ marginRight: 8 }} />
                            {avgScore}
                        </Title>
                    </div>
                </div>
            </Card>

            {/* Grades Table */}
            <Card>
                {filteredAnswers.length === 0 ? (
                    <Empty description="暂无成绩记录" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredAnswers}
                        rowKey="answerId"
                        pagination={{ pageSize: 10 }}
                    />
                )}
            </Card>
        </div>
    );
};

export default StudentGrades;
