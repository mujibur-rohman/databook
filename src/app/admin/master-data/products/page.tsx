"use client";

import { Card, Table, Button, Space, Input, Typography, Tag } from "antd";
import { Package, Plus, MagnifyingGlass } from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";

const { Title } = Typography;
const { Search } = Input;

export default function ProductsPage() {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nama Produk",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Harga",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `Rp ${price.toLocaleString()}`,
    },
    {
      title: "Stok",
      dataIndex: "stock",
      key: "stock",
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
      name: "Laptop Gaming ASUS ROG",
      category: "Electronics",
      price: 15000000,
      stock: 5,
      status: "Active",
    },
    {
      key: "2",
      id: 2,
      name: "Mouse Gaming Logitech",
      category: "Accessories",
      price: 500000,
      stock: 20,
      status: "Active",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2 flex items-center gap-2">
              <Package size={28} />
              Produk
            </Title>
          </div>
          <Button type="primary" icon={<Plus size={16} />}>
            Tambah Produk
          </Button>
        </div>

        <Card>
          <div className="mb-4">
            <Search
              placeholder="Cari produk..."
              prefix={<MagnifyingGlass size={16} />}
              style={{ width: 300 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
