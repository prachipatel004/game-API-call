import React, { useEffect, useState } from 'react';
import { Table, Input, Pagination, message, Image, Tag, Button, Popconfirm } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../Utils/AxioxInstamce';
const ContactUsList = () => {
    const navigate = useNavigate();
    const [contact, setContact] = useState([]);
    const [page, setPage] = useState(() => {
        const savedPage = localStorage.getItem('contact_page');
        return savedPage ? Number(savedPage) : 1;
    });

    const [perPage] = useState(5);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post(
                'http://sportapi.tracewavetransparency.com/api/v1/admin/common/contact_us_listing',
                {
                    page: page.toString(),
                    per_page: perPage.toString(),
                },
                {
                    headers: {
                        'api-key': 'game@tracewave',
                        platform: 'AnDroId@Trace',
                        'is-encript': 'false',
                        token: token,
                    },
                }
            );

            const result = response.data;
            if (result.code === "1") {
                setContact(result.data.result);
                setTotal(result.data.total);
            } else {
                message.error(result.message || 'Failed to fetch contacts');
            }
        } catch (error) {
            console.error('Error fetching contact data:', error);
            message.error('Something went wrong while fetching contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (contact_id) => {
        try {
            const token = localStorage.getItem('token');
            await axiosInstance.post(
                'http://sportapi.tracewavetransparency.com/api/v1/admin/common/delete_contact_us',
                { contact_id },
                {
                    headers: {
                        'api-key': 'game@tracewave',
                        platform: 'AnDroId@Trace',
                        'is-encript': 'false',
                        token: token,
                    },
                }
            );
            message.success('Contact deleted successfully');
            fetchUserData();
        } catch (error) {
            message.error(error.response?.data?.message || 'Delete failed');
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [page]);

    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Mobile',
            render: (record) => `${record.country_code} ${record.mobile_number}`,
        },
        { title: 'Description', dataIndex: 'description' },
        {
            title: 'Status',
            dataIndex: 'is_active',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Action',
            render: (record) => (
                <Popconfirm
                    title="Are you sure to delete this contact?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button danger type="link">
                        Delete
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <Table
                columns={columns}
                dataSource={contact}
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
                    localStorage.setItem('contact_page', page);
                }}

                style={{ marginTop: 16, textAlign: 'right' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <Button onClick={() => navigate('/faqlist')} style={{ border: '1px solid grey', backgroundColor: 'black', color: 'white' }}>Go to Faqs List</Button>
            </div>
        </div>
    );
};

export default ContactUsList;
