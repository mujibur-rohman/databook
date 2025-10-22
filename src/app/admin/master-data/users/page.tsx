"use client";

import { Card, Table, Button, Space, Input, Typography } from "antd";
import { Users, Plus, MagnifyingGlass } from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";

const { Title } = Typography;
const { Search } = Input;

export default function UsersPage() {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      key: "2",
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "Active",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2 flex items-center gap-2">
              <Users size={28} />
              Pengguna
            </Title>
          </div>
          <Button type="primary" icon={<Plus size={16} />}>
            Tambah Pengguna
          </Button>
        </div>

        <Card>
          <div className="mb-4">
            <Search
              placeholder="Cari pengguna..."
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
