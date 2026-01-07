import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, Empty, Input, Tag } from 'antd';
import { BookOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '../../services/course';
import { Course } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const StudentCourseList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (searchText) {
            const filtered = courses.filter(course =>
                course.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
                course.courseDescription?.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredCourses(filtered);
        } else {
            setFilteredCourses(courses);
        }
    }, [searchText, courses]);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const data = await getAllCourses();
            setCourses(data);
            setFilteredCourses(data);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradientByIndex = (index: number) => {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        ];
        return gradients[index % gradients.length];
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
                <Title level={4} style={{ margin: 0 }}>我的课程</Title>
                <Search
                    placeholder="搜索课程..."
                    allowClear
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {filteredCourses.length === 0 ? (
                <Empty description="暂无课程" />
            ) : (
                <Row gutter={[16, 16]}>
                    {filteredCourses.map((course, index) => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={course.courseId}>
                            <Card
                                hoverable
                                onClick={() => navigate(`/student/courses/${course.courseId}`)}
                                style={{
                                    height: '100%',
                                    borderRadius: 12,
                                    overflow: 'hidden'
                                }}
                                cover={
                                    <div style={{
                                        background: getGradientByIndex(index),
                                        height: 120,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <BookOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.9)' }} />
                                    </div>
                                }
                            >
                                <Card.Meta
                                    title={
                                        <Text strong ellipsis style={{ fontSize: 16 }}>
                                            {course.courseName}
                                        </Text>
                                    }
                                    description={
                                        <div>
                                            <Paragraph
                                                type="secondary"
                                                ellipsis={{ rows: 2 }}
                                                style={{ marginBottom: 12, minHeight: 44 }}
                                            >
                                                {course.courseDescription || '暂无描述'}
                                            </Paragraph>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Tag icon={<UserOutlined />} color="blue">
                                                    教师
                                                </Tag>
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default StudentCourseList;
