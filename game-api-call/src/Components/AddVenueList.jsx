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
} from 'antd';
import { data, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Option } = Select;

const getAuthHeaders = () => {
  const auth = JSON.parse(localStorage.getItem('auth'));
  return {
    'api-key': 'game@tracewave',
    platform: 'AnDroId@Trace',
    'is-encript': 'false',
    token: `${auth?.accessToken}`,
  };
};

const cityOptions = [
  { id: '1', name: 'Ahmedabad' },
  { id: '2', name: 'Mumbai' },
  { id: '3', name: 'Delhi' },
  { id: '4', name: 'Surat' },
];

const AddVenueForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [gameOptions, setGameOptions] = useState([]);

  useEffect(() => {
    fetchGames();
    form.setFieldsValue({
      games: [
        {
          game_id: undefined,
          price: '',
          weekend_price: '',
          slot_date: null,
          start_time: null,
          end_time: null,
          duration: '',
        },
      ],
    });
  }, []);

  const fetchGames = async () => {
    try {
      const res = await axios.post(
        'http://sportapi.tracewavetransparency.com/api/v1/admin/game/game_listing',
        { search: '', page: '1', per_page: '100' },
        { headers: getAuthHeaders() }
      );
      setGameOptions(res.data?.data?.result || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load games');
    }
  };

  const handleSubmit = async (values) => {
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
console.log(values);

    const payload = {
      name: values.name,
      city_id: values.city_id,
      description: values.description,
      location: values.location,
      venue_price: values.venue_price,
      venue_size: values.venue_size,
      venue_facilities: values.facilities || [],
      venue_prohibitions: values.prohibitions || [],
      venue_images: [
        "image1.jpg",
        "image2.jpg"],
      game_ids,
      slots,
    };

    try {
      const res = await axios.post(
        'http://sportapi.tracewavetransparency.com/api/v1/admin/venue/add_venue',
        payload,
        { headers: getAuthHeaders() }
      );

      toast(res.data?.message || 'Venue added');

      if (res.data?.code === 1) {
        navigate('/venuelist', { state: { reload: true } });
      }
    } catch (error) {
      toast(error?.response?.data?.message || 'Failed to add venue');
    }
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        style={{ maxWidth: 1000, margin: '0 auto' }}
      >
        <Divider>Basic Info</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="Venue Name" rules={[{ required: true }]}>
              <Input placeholder="Enter Name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="City" name="city_id" rules={[{ required: true }]}>
              <Select placeholder="Select City">
                {cityOptions.map((city) => (
                  <Option key={city.id} value={city.id}>
                    {city.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Venue Size" name="venue_size" rules={[{ required: true }]}>
              <Input placeholder="e.g. Large" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Venue Price" name="venue_price" rules={[{ required: true }]}>
              <Input placeholder="Enter venue price" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Location" name="location" rules={[{ required: true }]}>
              <Input placeholder="Enter location" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Description" name="description" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="Enter description" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="facilities" label="Facilities">
              <Select mode="tags" placeholder="Add facilities" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="prohibitions" label="Prohibitions">
              <Select mode="tags" placeholder="Add prohibitions" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Games</Divider>

        <Form.List name="games">
          {(fields, { add, remove }) => (
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
                        rules={[{ required: true }]}
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
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Enter price" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'weekend_price']}
                        label="Weekend Price"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Enter weekend price" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'slot_date']}
                        label="Slot Date"
                        rules={[{ required: true }]}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'start_time']}
                        label="Start Time"
                        rules={[{ required: true }]}
                      >
                        <TimePicker style={{ width: '100%' }} use12Hours format="hh:mm A" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'end_time']}
                        label="End Time"
                        rules={[{ required: true }]}
                      >
                        <TimePicker style={{ width: '100%' }} use12Hours format="hh:mm A" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'duration']}
                        label="Duration"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Enter duration" />
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
                <Button
                  onClick={() => add()}
                  block
                  style={{ backgroundColor: 'blue', color: 'white' }}
                >
                  + Add Game
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Venue
          </Button>
        </Form.Item>
      </Form>

      <ToastContainer />
    </>
  );
};

export default AddVenueForm;
