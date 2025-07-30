import React, { useEffect, useState } from 'react';
import {
    Table,
    Input,
    Pagination,
    message,
    Tag,
    Button,
    Modal,
    Form,
    Checkbox,
} from 'antd';
import axios from 'axios';
import axiosInstance from '../Utils/AxioxInstamce';
const FaqList = () => {
    const [faq, setFaq] = useState([]);
    const [page, setPage] = useState(() => {
        const savedPage = localStorage.getItem('faq_page');
        return savedPage ? Number(savedPage) : 1;
    });
    const [perPage] = useState(2);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post(
                'http://sportapi.tracewavetransparency.com/api/v1/admin/common/faqs_listing',
                {
                    page: page.toString(),
                    per_page: perPage.toString(),
                },
                {
                    headers: {
                        'api-key': 'game@tracewave',
                        platform: 'AnDroId@Trace',
                        'is-encript': 'false',
                        token,
                    },
                }
            );

            const result = response.data;
            if (result.code === '1') {
                setFaq(result.data.result);
                setTotal(result.data.total);
            } else {
                message.error(result.message || 'Failed to fetch FAQs');
            }
        } catch (error) {
            console.error('Error fetching FAQ data:', error);
            message.error('Something went wrong while fetching FAQs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [page]);

    const handleAddFaq = async (values) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post(
                'http://sportapi.tracewavetransparency.com/api/v1/admin/common/add_faqs',
                {
                    question: values.question,
                    answer: values.answer,
                },
                {
                    headers: {
                        'api-key': 'game@tracewave',
                        platform: 'AnDroId@Trace',
                        'is-encript': 'false',
                        token,
                    },
                }
            );

            const result = response.data;
            if (result.code === '1') {
                message.success(result.message || 'FAQ added successfully');
                setAddModalVisible(false);
                form.resetFields();
                fetchUserData();
            } else {
                message.error(result.message || 'Failed to add FAQ');
            }
        } catch (error) {
            console.error('Error adding FAQ:', error);
            message.error('Something went wrong while adding FAQ');
        }
    };

    const handleEditFaq = async (values) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post(
                'http://sportapi.tracewavetransparency.com/api/v1/admin/common/edit_faqs',
                {
                    faqs_id: editingFaq?.id.toString(),
                    question: values.question,
                    answer: values.answer,
                    is_active: values.is_active ? '1' : '0',
                    is_delete: '',
                },
                {
                    headers: {
                        'api-key': 'game@tracewave',
                        platform: 'AnDroId@Trace',
                        'is-encript': 'false',
                        token,
                    },
                }
            );

            const result = response.data;
            if (result.code === '1') {
                message.success(result.message || 'FAQ updated successfully');
                setEditModalVisible(false);
                fetchUserData();
            } else {
                message.error(result.message || 'Failed to update FAQ');
            }
        } catch (error) {
            console.error('Error updating FAQ:', error);
            message.error('Something went wrong while updating FAQ');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Question', dataIndex: 'question' },
        { title: 'Answer', dataIndex: 'answer' },
        {
            title: 'Status',
            dataIndex: 'is_active',
            render: (isActive) => (
                <Tag color={isActive === 1 || isActive === '1' ? 'green' : 'red'}>
                    {isActive === 1 || isActive === '1' ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        { title: 'Created At', dataIndex: 'created_at' },
        { title: 'Updated At', dataIndex: 'updated_at' },
        {
            title: 'Action',
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => {
                        setEditingFaq(record);
                        editForm.setFieldsValue({
                            question: record.question,
                            answer: record.answer,
                            is_active: record.is_active === 1 || record.is_active === '1',
                        });
                        setEditModalVisible(true);
                    }}
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>FAQ List</h2>
                <Button type="primary" onClick={() => setAddModalVisible(true)}>
                    Add FAQ
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={faq}
                rowKey="id"
                loading={loading}
                pagination={false}
                scroll={{ x: 1200 }}
            />

            <Pagination
                current={page}
                pageSize={perPage}
                total={total}
                onChange={(page) => {
                    setPage(page);
                    localStorage.setItem('faq_page', page);
                }}
                style={{ marginTop: 16, textAlign: 'right' }}
            />

            {/* Add FAQ Modal */}
            <Modal
                title="Add FAQ"
                open={addModalVisible}
                onCancel={() => setAddModalVisible(false)}
                onOk={() => form.submit()}
                okText="Add"
            >
                <Form form={form} layout="vertical" onFinish={handleAddFaq}>
                    <Form.Item
                        name="question"
                        label="Question"
                        rules={[{ required: true, message: 'Please enter a question' }]}
                    >
                        <Input placeholder="Enter FAQ question" />
                    </Form.Item>
                    <Form.Item
                        name="answer"
                        label="Answer"
                        rules={[{ required: true, message: 'Please enter an answer' }]}
                    >
                        <Input.TextArea placeholder="Enter FAQ answer" rows={4} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit FAQ Modal */}
            <Modal
                title="Edit FAQ"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={() => editForm.submit()}
                okText="Update"
            >
                <Form form={editForm} layout="vertical" onFinish={handleEditFaq}>
                    <Form.Item
                        name="question"
                        label="Question"
                        rules={[{ required: true, message: 'Please enter a question' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="answer"
                        label="Answer"
                        rules={[{ required: true, message: 'Please enter an answer' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="is_active" valuePropName="checked">
                        <Checkbox>Active</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FaqList;
