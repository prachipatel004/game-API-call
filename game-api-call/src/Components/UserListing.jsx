import React, { useEffect, useState} from 'react';
import { useNavigate} from 'react-router-dom';
import { Table, Input, Pagination, message, Image, Tag ,Button} from 'antd';
import axios from 'axios';
import axiosInstance from '../Utils/AxioxInstamce';
const UserList = () => {
const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage] = useState(5);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
   
    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await axiosInstance.post(
                'http://sportapi.tracewavetransparency.com/api/v1/admin/common/user_listing',
                {
                    page: page.toString(),
                    per_page: perPage.toString(),
                    search,
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
                setUsers(result.data.result);
                setTotal(result.data.total);
            } else {
                message.error(result.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            message.error('Something went wrong while fetching users');
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [page, search]);

    const columns = [
        {
            title: 'Image',
            dataIndex: 'image',
            render: (image) => (
                <Image src={image} alt="profile" width={50} height={50} />
            ),
        },
        { title: 'ID', dataIndex: 'id' },
        { title: 'login_type', dataIndex: 'login_type' },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Mobile',
            render: (record) => `${record.country_code} ${record.mobile_number}`,
        },
        { title: 'password', dataIndex: 'password' },
        { title: 'City', dataIndex: 'city' },
        { title: 'State', dataIndex: 'state' },
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
            title: 'Created At',
            dataIndex: 'created_at',
        },
    ];

    return (
        <div>
            <Input.Search
                placeholder="Search by name or email"
                allowClear
                enterButton
                onSearch={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                style={{ marginBottom: 16, width: 300 }}
            />

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                pagination={false}
                scroll={{ x: 1200 }}
            />
            <Pagination
                current={page}
                pageSize={perPage}
                total={total}
                onChange={(page) => setPage(page)}
                style={{ marginTop: 16, textAlign: 'right' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <Button onClick={() => navigate('/contactlist')} style={{ border: '1px solid grey', backgroundColor: 'black', color: 'white' }}>Go to contact us List</Button>
            </div>
        </div>
    );
};

export default UserList;
