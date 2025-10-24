"use client";
import { useState, useEffect } from "react";

import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Modal,
  Form,
  message,
  Popconfirm,
  Select,
} from "antd";

import {
  Stack,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";

const { Title } = Typography;
const { Search } = Input;

interface Series {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: Series[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SeriesPage() {
  const [data, setData] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Series | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    search = searchText,
    sort = sortBy,
    order = sortOrder
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy: sort,
        sortOrder: order,
      });

      const response = await fetch(`/api/series?${params}`, {
        credentials: "include",
      });

      if (response.ok) {
        const result: ApiResponse = await response.json();
        setData(result.data);
        setPagination((prev) => ({
          ...prev,
          current: result.pagination.page,
          total: result.pagination.total,
        }));
      } else {
        message.error("Gagal mengambil data series");
      }
    } catch {
      message.error("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTableChange = (pag: any, _filters: any, sorter: any) => {
    const newSortBy = sorter.field || "createdAt";
    const newSortOrder = sorter.order === "ascend" ? "asc" : "desc";

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination((prev) => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));

    fetchData(pag.current, pag.pageSize, searchText, newSortBy, newSortOrder);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(1, pagination.pageSize, value, sortBy, sortOrder);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item: Series) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: { name: string }) => {
    try {
      const url = editingItem ? `/api/series/${editingItem.id}` : "/api/series";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message);
        setIsModalOpen(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(result.error);
      }
    } catch {
      message.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/series/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message);
        fetchData();
      } else {
        message.error(result.error);
      }
    } catch {
      message.error("Terjadi kesalahan saat menghapus data");
    }
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 60,
      render: (_: unknown, __: Series, index: number) => {
        const currentPage = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Nama Series",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Dibuat",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString("id-ID"),
    },
    {
      title: "Diperbarui",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString("id-ID"),
    },
    {
      title: "Aksi",
      key: "actions",
      width: 120,
      render: (_: unknown, record: Series) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<PencilSimple size={16} />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Hapus Series"
            description="Apakah Anda yakin ingin menghapus series ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
          >
            <Button size="small" danger icon={<Trash size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2 flex items-center gap-2">
              <Stack size={28} />
              Series Management
            </Title>
          </div>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            Tambah Series
          </Button>
        </div>

        <Card>
          <div className="mb-4 flex gap-4 items-center">
            <Search
              placeholder="Cari series..."
              prefix={<MagnifyingGlass size={16} />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(value) => {
                const [field, order] = value.split("-");
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
                fetchData(
                  1,
                  pagination.pageSize,
                  searchText,
                  field,
                  order as "asc" | "desc"
                );
              }}
              style={{ width: 200 }}
            >
              <Select.Option value="createdAt-desc">Terbaru</Select.Option>
              <Select.Option value="createdAt-asc">Terlama</Select.Option>
              <Select.Option value="name-asc">Nama A-Z</Select.Option>
              <Select.Option value="name-desc">Nama Z-A</Select.Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} items`,
            }}
            onChange={handleTableChange}
            rowKey="id"
          />
        </Card>

        <Modal
          title={editingItem ? "Edit Series" : "Tambah Series"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Nama Series"
              rules={[
                { required: true, message: "Nama series harus diisi!" },
                { min: 2, message: "Nama series minimal 2 karakter!" },
              ]}
            >
              <Input placeholder="Masukkan nama series" />
            </Form.Item>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="primary" htmlType="submit">
                  {editingItem ? "Perbarui" : "Simpan"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
