import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  Row,
  Col,
  Tag,
  List,
  Typography,
  Image,
  Divider,
  Spin,
  message,
} from 'antd';

const { Title, Text } = Typography;

const VenueList = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const payload = {
        city_id: '',
        game_id: '',
        search: '',
        page: '1',
        per_page: '10',
      };

      const res = await axios.post(
        'http://sportapi.tracewavetransparency.com/api/v1/admin/venue/venue_listing',
        payload,
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

      if (res.data.status) {
        setVenues(res.data.data.result);
      } else {
        message.error(res.data.message || 'Failed to fetch venues');
      }
    } catch (error) {
      message.error('Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>
        {venues.map((venue) => (
          <Col key={venue.id} xs={24} sm={12} md={8}>
            <Card
              title={venue.name}
              cover={
                venue.venue_images?.length > 0 && (
                  <Image
                    src={venue.venue_images[0].image}
                    alt={venue.name}
                    height={200}
                    width="100%"
                    style={{ objectFit: 'cover' }}
                    preview={false}
                  />
                )
              }
              bordered
            >
              <Text strong>City:</Text> {venue.city_name}
              <br />
              <Text strong>Location:</Text> {venue.location}
              <br />
              <Text strong>Price:</Text> ₹{venue.venue_price}
              <br />
              <Text strong>Size:</Text> {venue.venue_size}
              <Divider />

              <Title level={5}>Games</Title>
              <List
                size="small"
                dataSource={venue.games}
                renderItem={(game) => (
                  <List.Item>
                    <Image
                      src={game.photo}
                      width={40}
                      height={40}
                      style={{ objectFit: 'cover', marginRight: 8 }}
                      preview={false}
                    />
                    <Text>
                      {game.name} - ₹{game.price} / ₹{game.weekend_price}
                    </Text>
                  </List.Item>
                )}
              />

              <Divider />
              <Title level={5}>Facilities</Title>
              {venue.facilities.map((f) => (
                <Tag color="blue" key={f.id}>
                  {f.name}
                </Tag>
              ))}

              <Divider />
              <Title level={5}>Prohibitions</Title>
              {venue.prohibitions.map((p) => (
                <Tag color="red" key={p.id}>
                  {p.name}
                </Tag>
              ))}

              <Divider />
              <Title level={5}>Slots</Title>
              <List
                size="small"
                dataSource={venue.slots}
                renderItem={(slot) => (
                  <List.Item>
                    <Text>
                      {slot.slot_date} | {slot.start_time} - {slot.end_time} |{' '}
                      {slot.duration} hrs
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Spin>
  );
};

export default VenueList;
