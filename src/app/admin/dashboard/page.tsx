"use client";
import { Typography } from "antd";
import AdminLayout from "@/components/layouts/AdminLayout";

const { Title, Text } = Typography;

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Title level={2} className="mb-2">
            Dashboard
          </Title>
          <Text type="secondary">Selamat datang di panel admin DataBook</Text>
        </div>
      </div>
    </AdminLayout>
  );
}
