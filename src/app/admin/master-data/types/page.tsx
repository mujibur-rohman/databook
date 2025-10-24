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
  Tag,
} from "antd";
import {
  Tag as TagIcon,
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface Series {
  id: number;
  name: string;
}

interface Type {
  id: number;
  name: string;
  code: string;
  description: string;
  seriesId: number;
  createdAt: string;
  updatedAt: string;
  series?: {
    id: number;
    name: string;
  };
}

interface ApiResponse {
  data: Type[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TypesPage() {
  const [data, setData] = useState<Type[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Type | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [filterSeriesId, setFilterSeriesId] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchSeriesList = async () => {
    try {
      const response = await fetch("/api/series?limit=1000", {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        setSeriesList(result.data);
      }
    } catch {
      message.error("Gagal mengambil data series");
    }
  };

  const fetchData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    search = searchText,
    seriesId = filterSeriesId,
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

      if (seriesId) {
        params.append("seriesId", seriesId);
      }

      const response = await fetch(`/api/types?${params}`, {
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
        message.error("Gagal mengambil data types");
      }
    } catch {
      message.error("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeriesList();
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

    fetchData(
      pag.current,
      pag.pageSize,
      searchText,
      filterSeriesId,
      newSortBy,
      newSortOrder
    );
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(1, pagination.pageSize, value, filterSeriesId, sortBy, sortOrder);
  };

  const handleSeriesFilter = (value: string) => {
    setFilterSeriesId(value);
    fetchData(1, pagination.pageSize, searchText, value, sortBy, sortOrder);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item: Type) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: {
    name: string;
    code: string;
    description: string;
    seriesId: number;
  }) => {
    try {
      const url = editingItem ? `/api/types/${editingItem.id}` : "/api/types";
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
      const response = await fetch(`/api/types/${id}`, {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (_: unknown, __: unknown, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Nama Type",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Kode Type",
      dataIndex: "code",
      key: "code",
      sorter: true,
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      sorter: true,
      width: 200,
      ellipsis: true,
    },
    {
      title: "Series",
      dataIndex: ["series", "name"],
      key: "series",
      render: (seriesName: string) => <Tag color="blue">{seriesName}</Tag>,
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
      render: (_: unknown, record: Type) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<PencilSimple size={16} />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Hapus Type"
            description="Apakah Anda yakin ingin menghapus type ini?"
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
              <TagIcon size={28} />
              Types Management
            </Title>
          </div>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            Tambah Type
          </Button>
        </div>

        <Card>
          <div className="mb-4 flex gap-4 items-center flex-wrap">
            <Search
              placeholder="Cari nama, kode, atau deskripsi..."
              prefix={<MagnifyingGlass size={16} />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Filter by Series"
              allowClear
              value={filterSeriesId || undefined}
              onChange={handleSeriesFilter}
              style={{ width: 200 }}
            >
              {seriesList.map((series) => (
                <Select.Option key={series.id} value={series.id.toString()}>
                  {series.name}
                </Select.Option>
              ))}
            </Select>
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
                  filterSeriesId,
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
              <Select.Option value="code-asc">Kode A-Z</Select.Option>
              <Select.Option value="code-desc">Kode Z-A</Select.Option>
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
            scroll={{ x: 1000 }}
          />
        </Card>

        <Modal
          title={editingItem ? "Edit Type" : "Tambah Type"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Nama Type"
              rules={[
                { required: true, message: "Nama type harus diisi!" },
                { min: 2, message: "Nama type minimal 2 karakter!" },
              ]}
            >
              <Input placeholder="Masukkan nama type" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Kode Type"
              rules={[
                { required: true, message: "Kode type harus diisi!" },
                { min: 3, message: "Kode type minimal 3 karakter!" },
              ]}
            >
              <Input placeholder="Masukkan kode type (contoh: D09200)" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Deskripsi"
              rules={[
                { required: true, message: "Deskripsi harus diisi!" },
                { min: 5, message: "Deskripsi minimal 5 karakter!" },
              ]}
            >
              <TextArea rows={3} placeholder="Masukkan deskripsi type" />
            </Form.Item>

            <Form.Item
              name="seriesId"
              label="Series"
              rules={[{ required: true, message: "Series harus dipilih!" }]}
            >
              <Select placeholder="Pilih series">
                {seriesList.map((series) => (
                  <Select.Option key={series.id} value={series.id}>
                    {series.name}
                  </Select.Option>
                ))}
              </Select>
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
