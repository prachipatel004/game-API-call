import React, { useEffect } from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import axios from 'axios';
import { fetchGames } from './GameSlice';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from './AuthSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    // ✅ Redirect if already logged in
    useEffect(() => {
        const storedAuth = JSON.parse(localStorage.getItem('auth'));
        if (storedAuth?.accessToken) {
            dispatch(loginSuccess(storedAuth)); // <-- ensures Redux is aware
            navigate('/gamelist');
        }
    }, [dispatch, navigate]);

    const onFinish = async (values) => {
        try {
            const response = await axios.post(
                'http://sportapi.tracewavetransparency.com/api/v1/admin/auth/login',
                values,
                {
                    headers: {
                        'api-key': 'game@tracewave',
                        'platform': 'AnDroId@Trace',
                        'is-encript': 'false'
                    }
                }
            );

            const res = response.data;
            if (res?.status) {
                localStorage.setItem('auth', JSON.stringify(res.data));
                dispatch(loginSuccess(res.data));
                dispatch(fetchGames());
                toast.success('Login successful!');
                navigate('/gamelist');
            } else {
                toast.error(res.message || 'Invalid email or password');
            }
        } catch (error) {
            toast.error('Invalid email or password');
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: '100px auto' }}>
            <ToastContainer />
            <h2 style={{ textAlign: 'center' }}>Login</h2>
            <Form
                name="login"
                layout="vertical"
                initialValues={{
                    remember: true,
                    email: 'admin@gmail.com',
                    password: 'Admin@123',
                }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item name="remember" valuePropName="checked">
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
