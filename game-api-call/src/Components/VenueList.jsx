import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  Typography,
  Image,
  Spin,
  message,
  Button,
  Row,
  Col,
  Space,
  Tag,
  Input,
  Popconfirm,
  Modal,
  Form,
  Select,
  Divider,
  DatePicker,
  TimePicker,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Text } = Typography;
const { TextArea } = Input;
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

const VenueList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editForm] = Form.useForm();
  const [gameOptions, setGameOptions] = useState([]);

  const [cityId, setCityId] = useState('');
  const [gameId, setGameId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch games for dropdown
  const loadGames = async () => {
    const headers = getAuthHeaders();
    try {
      const res = await axios.post(
        'http://sportapi.tracewavetransparency.com/api/v1/admin/game/game_listing',
        { page: '1', per_page: '100', search: '' },
        { headers }
      );
      
      if (res.data.code === '1') {
        setGameOptions(res.data.data.result || []); 
      }
    } catch (error) {
      message.error('Failed to load game options');
    }
  };

  // Fetch venue list
  const fetchVenues = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setLoading(true);
    const payload = {
      city_id: cityId,
      game_id: gameId,
      search: search,
      page: page.toString(),
      per_page: '10',
    };

    try {
      const res = await axios.post(
        'http://sportapi.tracewavetransparency.com/api/v1/admin/venue/venue_listing',
        payload,
        { headers }
      );
      if (res.data.code === -1) throw new Error('Invalid or expired token');

      setVenues(res.data.data.result);
      setTotal(res.data.data.total);
    } catch (error) {
      message.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
    loadGames(); 
  }, []);

  useEffect(() => {
    if (location.state?.reload) {
      setCityId('');
      setGameId('');
      setSearch('');
      setPage(1);
      fetchVenues();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDelete = async (id) => {
    const headers = getAuthHeaders();
    try {
      const res = await axios.post(
        'http://sportapi.tracewavetransparency.com/api/v1/admin/venue/delete_venue',
        { venue_id: id },
        { headers }
      );
      if (res.data.code === 1) {
        message.success('Venue deleted successfully');
        fetchVenues();
      } else {
        message.error(res.data.message || 'Failed to delete venue');
      }
    } catch (error) {
      message.error(error.message || 'Delete failed');
    }
  };

  const handleEdit = (venue) => {
    const gamesData = venue.slots.map((s) => ({
      game_id: s.game_id,
      price: s.price,
      weekend_price: s.weekend_price,
      slot_date: moment(s.slot_date),
      start_time: moment(s.start_time, 'hh:mm A'),
      end_time: moment(s.end_time, 'hh:mm A'),
      duration: s.duration,
    }));

    setEditingVenue(venue);
    editForm.setFieldsValue({
      name: venue.name,
      city_id: venue.city_id,
      description: venue.description,
      location: venue.location,
      venue_price: venue.venue_price,
      venue_size: venue.venue_size,
      facilities: venue.facilities.map((f) => f.name),
      prohibitions: venue.prohibitions.map((p) => p.name),
      images: venue.venue_images.map((img) => img.image),
      games: gamesData,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    const headers = getAuthHeaders();
    try {
      const values = await editForm.validateFields();

      const payload = {
        venue_id: editingVenue.id,
        name: values.name,
        city_id: values.city_id,
        description: values.description,
        location: values.location,
        venue_price: values.venue_price,
        venue_size: values.venue_size,
        venue_images: values.images,
        venue_facilities: values.facilities,
        venue_prohibitions: values.prohibitions,
        game_ids: values.games.map((g) => ({
          game_id: g.game_id,
          price: g.price,
          weekend_price: g.weekend_price,
          game_name: gameOptions.find((opt) => opt.id === g.game_id)?.name || '',
        })),
        slots: values.games.map((g) => ({
          game_id: g.game_id,
          slot_date: g.slot_date.format('YYYY-MM-DD'),
          start_time: g.start_time.format('hh:mm A'),
          end_time: g.end_time.format('hh:mm A'),
          duration: g.duration,
        })),
      };

      const res = await axios.post(
        'http://sportapi.tracewavetransparency.com/api/v1/admin/venue/edit_venue',
        payload,
        { headers }
      );

      if (res.data.code === 1) {
        message.success('Venue updated');
        setEditModalVisible(false);
        setEditingVenue(null);
        fetchVenues();
      } else {
        message.error(res.data.message || 'Update failed');
      }
    } catch (error) {
      message.error(error.message || 'Something went wrong while updating');
    }
  };

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>Venue Listing</h1>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <Button
          type="primary"
          style={{ width: '200px' }}
          onClick={() => navigate('/addvenue', { state: { from: 'listing' } })}
        >
          Add Venue
        </Button>
      </div>

      <Spin spinning={loading}>
        <List
          itemLayout="vertical"
          dataSource={venues}
          renderItem={(venue) => (
            <List.Item key={venue.id}>
              <Row gutter={16} align="middle">
                <Col span={3}>
                  <Image
                    src={venue.venue_images[0]?.image}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover' }}
                    preview={false}
                  />
                </Col>
                <Col span={16}>
                  <Text strong>Name:</Text> {venue.name} <br />
                  <Text strong>City:</Text> {venue.city_name}, {venue.location} <br />
                  <Text strong>Price:</Text> ₹{venue.venue_price} <br />
                  <Text strong>Size:</Text> {venue.venue_size} <br />
                  <Text strong>Games:</Text>{' '}
                  {venue.games.map((g) => (
                    <Tag key={g.id}>{g.name}</Tag>
                  ))}{' '}
                  <br />
                  <Text strong>Slots:</Text>{' '}
                  {venue.slots.map((s, i) => (
                    <Text key={i}>[{s.slot_date} | {s.start_time}-{s.end_time}] </Text>
                  ))}
                </Col>
                <Col span={5}>
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(venue)}>
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete this venue?"
                      onConfirm={() => handleDelete(venue.id)}
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title="Edit Venue"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        width={900}
        okText="Update"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="Venue Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="city_id" label="City ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="venue_price" label="Price" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="venue_size" label="Size" rules={[{ required: true }]}>
            <Select>
              <Option value="small">Small</Option>
              <Option value="medium">Medium</Option>
              <Option value="large">Large</Option>
            </Select>
          </Form.Item>
          <Form.Item name="images" label="Images">
            <Select mode="tags" />
          </Form.Item>
          <Form.Item name="facilities" label="Facilities">
            <Select mode="tags" />
          </Form.Item>
          <Form.Item name="prohibitions" label="Prohibitions">
            <Select mode="tags" />
          </Form.Item>

          <Divider>Game Slots</Divider>

          <Form.List name="games">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, i) => (
                  <div key={key} style={{ border: '1px solid #eee', padding: 16, marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'game_id']} label="Game">
                          <Select placeholder="Select game">
                            {gameOptions.map((g) => (
                              <Option key={g.id} value={g.id}>
                                {g.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'price']} label="Price">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'weekend_price']} label="Weekend Price">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'slot_date']} label="Slot Date">
                          <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'start_time']} label="Start Time">
                          <TimePicker style={{ width: '100%' }} use12Hours format="hh:mm A" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'end_time']} label="End Time">
                          <TimePicker style={{ width: '100%' }} use12Hours format="hh:mm A" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...restField} name={[name, 'duration']} label="Duration">
                          <Input />
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
                <Button onClick={() => add()} block>
                  + Add Game Slot
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  );
};

export default VenueList;
