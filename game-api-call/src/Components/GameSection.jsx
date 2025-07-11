import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  Row,
  Col,
  Select,
  Divider,
  message,
} from 'antd';
import axios from 'axios';

const { Option } = Select;

const AddGameSection = () => {
  const [form] = Form.useForm();
  const [gameOptions, setGameOptions] = useState([]);
  const [hasInitialGame, setHasInitialGame] = useState(false); 

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await axios.post(
        'http://sportapi.tracewavetransparency.com/api/v1/admin/game/game_listing',
        {
          search: '',
          page: '1',
          per_page: '100',
        },
        {
          headers: {
            'api-key': 'game@tracewave',
            platform: 'AnDroId@Trace',
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyNiwiaWF0IjoxNzUxOTUzOTQ4LCJleHAiOjE3NTIwNDAzNDh9.6k60j-HyjRaz_fTf6MJe_8U9wqrAXhH4eATFMa3mJug',
            'is-encript': 'false',
          },
        }
      );
      setGameOptions(res.data?.data?.result || []);
    } catch (error) {
      console.error('Failed to fetch games', error);
      message.error('Failed to load games');
    }
  };

  const onFinish = (values) => {
    const game_ids = values.games.map((g) => ({
      game_id: g.game_id,
      price: g.price,
      weekend_price: g.weekend_price,
    }));

    const slots = values.games.map((g) => ({
      game_id: g.game_id,
      slot_date: g.slot_date.format('YYYY-MM-DD'),
      start_time: g.start_time.format('HH:mm:ss'),
      end_time: g.end_time.format('HH:mm:ss'),
      duration: g.duration,
    }));

    const payload = {
      game_ids,
      slots,
    };

    console.log('Payload:', payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      style={{ maxWidth: 900, margin: '0 auto' }}
    >
      <Form.List name="games">
        {(fields, { add, remove }) => {
          useEffect(() => {
            if (fields.length === 0 && !hasInitialGame) {
              add(); 
              setHasInitialGame(true);
            }
          }, [fields, add, hasInitialGame]);

          return (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <div
                  key={key}
                  style={{
                    border: '1px solid #f0f0f0',
                    padding: '20px',
                    marginBottom: '20px',
                    borderRadius: '6px',
                  }}
                >
                  <Divider orientation="left">Game {index + 1}</Divider>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'game_id']}
                        label="Game"
                        rules={[{ required: true, message: 'Please select a game' }]}
                      >
                        <Select placeholder="Select game">
                          {gameOptions.map((g) => (
                            <Option value={g.id} key={g.id}>
                              {g.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'price']}
                        label="Price"
                        rules={[{ required: true, message: 'Enter price' }]}
                      >
                        <Input placeholder="Enter price" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'weekend_price']}
                        label="Weekend Price"
                        rules={[{ required: true, message: 'Enter weekend price' }]}
                      >
                        <Input placeholder="Enter weekend price" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'slot_date']}
                        label="Slot Date"
                        rules={[{ required: true, message: 'Select date' }]}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'start_time']}
                        label="Start Time"
                        rules={[{ required: true, message: 'Select time' }]}
                      >
                        <TimePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'end_time']}
                        label="End Time"
                        rules={[{ required: true, message: 'Select time' }]}
                      >
                        <TimePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'duration']}
                        label="Duration"
                        rules={[{ required: true, message: 'Enter duration' }]}
                      >
                        <Input placeholder="Enter duration (hours)" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {fields.length > 1 && (
                    <Button danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Form.Item>
                <Button  onClick={() => add()} block style={{ backgroundColor: 'blue', color: '#fff' }}>
                  + Add Game
                </Button>
              </Form.Item>
            </>
          );
        }}
      </Form.List>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit Venue Games
        </Button>
      </Form.Item>
    </Form>
  );
  
};

export default AddGameSection;
