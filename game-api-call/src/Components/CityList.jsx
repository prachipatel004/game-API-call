import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCities, addCity, editCity, deleteCity } from './CitySlice';
import { Table, Button, Modal, Form, Input, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const CityList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cities = useSelector((state) => state.cities.list);
    const loading = useSelector((state) => state.cities.loading);
    const error = useSelector((state) => state.cities.error);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchCities());
    }, [dispatch]);

    const onFinish = async (values) => {
        try {
            if (editingCity) {
                await dispatch(editCity({ ...editingCity, ...values })).unwrap();
                message.success('City updated successfully');
            } else {
                await dispatch(addCity(values)).unwrap();
                message.success('City added successfully');
            }

            dispatch(fetchCities());
            setIsModalOpen(false);
            form.resetFields();
            setEditingCity(null);
        } catch (err) {
            message.error(err || 'Operation failed');
        }
    };

    const handleEdit = (city) => {
        setEditingCity(city);
        form.setFieldsValue(city);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteCity(id)).unwrap();
            message.success('City deleted successfully');
        } catch (err) {
            message.error(err || 'Delete failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    const columns = [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Name', dataIndex: 'name' },
        {
            title: 'Action',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, position: 'relative' }}>

            <div style={{ position: 'absolute', top: 24, right: 24 }}>
                <Button danger onClick={handleLogout}>Logout</Button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h1 style={{ marginBottom: 8 }}>City Listing</h1>
                <Button
                    type="primary"
                    onClick={() => {
                        form.resetFields();
                        setEditingCity(null);
                        setIsModalOpen(true);
                    }}
                    style={{ width: '200px' }}
                >
                    Add City
                </Button>
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}

            <Table
                dataSource={cities}
                columns={columns}
                rowKey="id"
                loading={loading}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <Button onClick={() => navigate('/venuelist')} style={{ border: '1px solid grey', backgroundColor: 'black', color: 'white' }}>Go to Venue List</Button>
            </div>
            <Modal
                title={editingCity ? 'Edit City' : 'Add City'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="name" label="City Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CityList;
