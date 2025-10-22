"use client";

import { Card, Row, Col, Statistic, Typography, Space, Progress } from "antd";
import {
  Users,
  Package,
  ShoppingCart,
  TrendUp,
  ArrowUp,
  ArrowDown,
} from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Pengguna",
      value: 1234,
      prefix: <Users size={24} className="text-blue-500" />,
      change: 12.5,
      changeType: "increase" as const,
    },
    {
      title: "Total Produk",
      value: 567,
      prefix: <Package size={24} className="text-green-500" />,
      change: 8.2,
      changeType: "increase" as const,
    },
    {
      title: "Penjualan Hari Ini",
      value: 89,
      prefix: <ShoppingCart size={24} className="text-purple-500" />,
      change: 2.4,
      changeType: "decrease" as const,
    },
    {
      title: "Pendapatan",
      value: 125000000,
      precision: 0,
      prefix: <TrendUp size={24} className="text-orange-500" />,
      suffix: "IDR",
      change: 15.3,
      changeType: "increase" as const,
    },
  ];

  const recentActivities = [
    {
      title: "Pengguna baru mendaftar",
      description: "John Doe telah mendaftar sebagai pengguna baru",
      time: "5 menit yang lalu",
      type: "user",
    },
    {
      title: "Produk ditambahkan",
      description: "Laptop Gaming ASUS ROG ditambahkan ke katalog",
      time: "15 menit yang lalu",
      type: "product",
    },
    {
      title: "Pesanan baru",
      description: "Pesanan #12345 telah dibuat",
      time: "30 menit yang lalu",
      type: "order",
    },
    {
      title: "Pembayaran dikonfirmasi",
      description: "Pembayaran untuk pesanan #12340 dikonfirmasi",
      time: "1 jam yang lalu",
      type: "payment",
    },
  ];

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

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  precision={stat.precision || 0}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  valueStyle={{ color: "#1677ff" }}
                />
                <div className="mt-2 flex items-center">
                  {stat.changeType === "increase" ? (
                    <ArrowUp size={16} className="text-green-500 mr-1" />
                  ) : (
                    <ArrowDown size={16} className="text-red-500 mr-1" />
                  )}
                  <Text
                    type={stat.changeType === "increase" ? "success" : "danger"}
                    className="text-sm"
                  >
                    {stat.change}%
                  </Text>
                  <Text type="secondary" className="text-sm ml-1">
                    dari bulan lalu
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          {/* Chart Area */}
          <Col xs={24} lg={16}>
            <Card title="Statistik Penjualan" className="h-96">
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <TrendUp size={64} className="text-gray-300 mx-auto mb-4" />
                  <Text type="secondary">Chart akan ditampilkan di sini</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Recent Activities */}
          <Col xs={24} lg={8}>
            <Card title="Aktivitas Terkini" className="h-96">
              <Space direction="vertical" className="w-full" size="middle">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="pb-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Text strong className="text-sm">
                          {activity.title}
                        </Text>
                        <div className="mt-1">
                          <Text type="secondary" className="text-xs">
                            {activity.description}
                          </Text>
                        </div>
                        <div className="mt-1">
                          <Text type="secondary" className="text-xs">
                            {activity.time}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Progress Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card title="Target Penjualan Bulanan">
              <Progress
                type="circle"
                percent={75}
                format={(percent) => `${percent}%`}
              />
              <div className="mt-4 text-center">
                <Text type="secondary">75% dari target Rp 200.000.000</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card title="Kepuasan Pelanggan">
              <Progress
                type="circle"
                percent={92}
                strokeColor="#52c41a"
                format={(percent) => `${percent}%`}
              />
              <div className="mt-4 text-center">
                <Text type="secondary">Rating rata-rata 4.6/5.0</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card title="Stok Produk">
              <Progress
                type="circle"
                percent={68}
                strokeColor="#faad14"
                format={(percent) => `${percent}%`}
              />
              <div className="mt-4 text-center">
                <Text type="secondary">68% produk tersedia</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
