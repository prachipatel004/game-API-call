import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGames, deleteGame, addGame, editGame } from './GameSlice';
import { Table, Button, Modal, Form, Input, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const GameList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const games = useSelector((state) => state.games.list);
    const loading = useSelector((state) => state.games.loading);
    const error = useSelector((state) => state.games.error);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(fetchGames());
    }, [dispatch]);

    const onFinish = async (values) => {
        try {
            if (editingGame) {
                await dispatch(editGame({ ...editingGame, ...values })).unwrap();
                message.success('Game updated successfully');
            } else {
                await dispatch(addGame(values)).unwrap();
                message.success('Game added successfully');
            }

            await dispatch(fetchGames()).unwrap();
            setIsModalOpen(false);
            form.resetFields();
            setEditingGame(null);
        } catch (err) {
            message.error(err || 'Operation failed');
        }
    };

    const handleEdit = (game) => {
        setEditingGame(game);
        form.setFieldsValue(game);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteGame(id)).unwrap();
            message.success('Game deleted successfully');
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
            title: 'Image',
            dataIndex: 'photo',
            render: (url) => <img src={url} alt="game" style={{ width: 60 }} />,
        },
        {
            title: 'Action',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24, position: 'relative', minHeight: '100vh' }}>
          
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
                <Button onClick={handleLogout} danger>Logout</Button>
            </div>

          
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h1>Game Listing</h1>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <Button
                    type="primary"
                    onClick={() => {
                        form.resetFields();
                        setEditingGame(null);
                        setIsModalOpen(true);
                    }}
                    style={{ width: '200px' }}
                >
                    Add Game
                </Button>
            </div>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}
            <Table
                dataSource={games}
                columns={columns}
                rowKey="id"
                loading={loading}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <Button onClick={() => navigate('/citylist')} style={{border:'1px solid grey',backgroundColor:'black',color:'white'}}>Go to City List</Button>
            </div>
            <Modal
                title={editingGame ? 'Edit Game' : 'Add Game'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="name" label="Game Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="photo" label="Game Image URL" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default GameList;
