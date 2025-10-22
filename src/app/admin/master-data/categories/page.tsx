"use client";

import { Card, Table, Button, Space, Input, Typography, Tag } from "antd";
import { ListBullets, Plus, MagnifyingGlass } from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";

const { Title } = Typography;
const { Search } = Input;

export default function CategoriesPage() {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nama Kategori",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Jumlah Produk",
      dataIndex: "productCount",
      key: "productCount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      render: () => (
        <Space>
          <Button size="small" type="primary">
            Edit
          </Button>
          <Button size="small" danger>
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      id: 1,
      name: "Electronics",
      description: "Perangkat elektronik dan gadget",
      productCount: 25,
      status: "Active",
    },
    {
      key: "2",
      id: 2,
      name: "Accessories",
      description: "Aksesoris komputer dan perangkat",
      productCount: 15,
      status: "Active",
    },
    {
      key: "3",
      id: 3,
      name: "Software",
      description: "Perangkat lunak dan aplikasi",
      productCount: 8,
      status: "Inactive",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2 flex items-center gap-2">
              <ListBullets size={28} />
              Kategori
            </Title>
          </div>
          <Button type="primary" icon={<Plus size={16} />}>
            Tambah Kategori
          </Button>
        </div>

        <Card>
          <div className="mb-4">
            <Search
              placeholder="Cari kategori..."
              prefix={<MagnifyingGlass size={16} />}
              style={{ width: 300 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
