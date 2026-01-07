import React, { useEffect, useState } from 'react';
import {
    Card, Form, Input, DatePicker, Button, message, Typography, Spin, Space
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '../../services/auth';
import { getCourseById } from '../../services/course';
import { createAssignment } from '../../services/assignment';
import { Course } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CreateAssignment: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [course, setCourse] = useState<Course | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const user = getCurrentUser();

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        if (!courseId) return;

        setLoading(true);
        try {
            const courseData = await getCourseById(courseId);
            setCourse(courseData);
        } catch (error) {
            console.error('Failed to load course:', error);
            message.error('加载课程信息失败');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values: any) => {
        if (!courseId || !user?.userId) return;

        setSubmitting(true);
        try {
            const [startTime, endTime] = values.timeRange;

            const assignment = await createAssignment({
                courseId,
                teacherId: user.userId,
                assignmentTitle: values.title,
                assignmentContent: values.content,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                assignmentStatus: 'NotStarted',
            });

            if (assignment) {
                message.success('作业发布成功');
                navigate('/teacher/courses');
            } else {
                message.error('作业发布失败');
            }
        } catch (error) {
            console.error('Failed to create assignment:', error);
            message.error('作业发布失败');
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

    if (!course) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">课程不存在</Text>
                    <br />
                    <Button type="link" onClick={() => navigate('/teacher/courses')}>
                        返回课程列表
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/teacher/courses')}
                    style={{ paddingLeft: 0 }}
                >
                    返回课程列表
                </Button>
            </div>

            <Title level={4} style={{ marginBottom: 8 }}>发布新作业</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                课程：{course.courseName}
            </Text>

            <Card style={{ maxWidth: 800 }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="title"
                        label="作业标题"
                        rules={[{ required: true, message: '请输入作业标题' }]}
                    >
                        <Input placeholder="请输入作业标题" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="作业内容/要求"
                        rules={[{ required: true, message: '请输入作业内容' }]}
                    >
                        <TextArea
                            rows={6}
                            placeholder="请输入作业的详细内容和要求..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="timeRange"
                        label="作业时间"
                        rules={[{ required: true, message: '请选择作业开始和截止时间' }]}
                    >
                        <RangePicker
                            showTime
                            style={{ width: '100%' }}
                            placeholder={['开始时间', '截止时间']}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button onClick={() => navigate('/teacher/courses')}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                发布作业
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateAssignment;
