import React, { useEffect, useState } from 'react';
import {
  Table,
  Image,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Upload,
  message,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { fetchBannerData } from '../Utils/FetchBannerData';
import useBannerStore from '../Store/BannerStore';
const { RangePicker } = DatePicker;

const BannerList = () => {
  const banners = useBannerStore((state) => state.banners);
  const setBanners = useBannerStore((state) => state.setBanners);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    fetchBannerData();
  }, []);

  const openEditModal = (record) => {
    setEditingBanner(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: record.name,
      dateRange: [dayjs(record.start_date), dayjs(record.end_date)],
      start_time: dayjs(record.start_time, 'HH:mm'),
      end_time: dayjs(record.end_time, 'HH:mm'),
    });
  };

  const handleAddOrEditBanner = async (values) => {
    setLoading(true);
    const token = localStorage.getItem('token');

    const payload = {
      name: values.name,
      image: uploadFile ? uploadFile.name : editingBanner?.image,
      start_date: values.dateRange[0].format('YYYY-MM-DD'),
      end_date: values.dateRange[1].format('YYYY-MM-DD'),
      start_time: values.start_time.format('HH:mm'),
      end_time: values.end_time.format('HH:mm'),
      banner_id: editingBanner?.id || undefined,
      is_active: editingBanner?.is_active || '1',
      is_delete: '0',
    };

    const url = editingBanner
      ? 'http://sportapi.tracewavetransparency.com/api/v1/admin/common/edit_banner'
      : 'http://sportapi.tracewavetransparency.com/api/v1/admin/common/add_banner';

    try {
      await axios.post(url, payload, {
        headers: {
          'api-key': 'game@tracewave',
          platform: 'AnDroId@Trace',
          'is-encript': 'false',
          token: token,
        },
      });

      message.success(editingBanner ? 'Banner updated successfully!' : 'Banner added successfully!');
      setIsModalOpen(false);
      setEditingBanner(null);
      setUploadFile(null);
      form.resetFields();
      await fetchBannerData();
    } catch (err) {
      message.error('Failed to save banner.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (img) => <Image width={100} src={img} />,
    },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
    { title: 'Start Time', dataIndex: 'start_time', key: 'start_time' },
    { title: 'End Time', dataIndex: 'end_time', key: 'end_time' },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active === '1' ? 'green' : 'red'}>
          {active === '1' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => openEditModal(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Banner List</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBanner(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          Add Banner
        </Button>
      </div>

      <Table
        dataSource={banners}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 7 }}
        loading={loading}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingBanner ? 'Edit Banner' : 'Add New Banner'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingBanner(null);
          setUploadFile(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEditBanner}>
          <Form.Item
            name="name"
            label="Banner Name"
            rules={[{ required: true, message: 'Please enter banner name' }]}
          >
            <Input placeholder="Enter banner name" />
          </Form.Item>

          <Form.Item name="image" label="Upload Image">
            <Upload
              beforeUpload={(file) => {
                setUploadFile(file);
                return false;
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
            {uploadFile && <div style={{ marginTop: 8 }}>Selected: {uploadFile.name}</div>}
            {!uploadFile && editingBanner?.image && (
              <div style={{ marginTop: 8 }}>Current: {editingBanner.image}</div>
            )}
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Start and End Date"
            rules={[{ required: true, message: 'Select date range' }]}
          >
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: 'Select start time' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true, message: 'Select end time' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerList;
