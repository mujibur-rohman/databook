"use client";

import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Typography,
  Space,
  Divider,
} from "antd";
import { Gear, FloppyDisk } from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";

const { Title } = Typography;
const { TextArea } = Input;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const onFinish = (values: Record<string, string | boolean>) => {
    console.log("Settings saved:", values);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <Title level={2} className="mb-2 flex items-center gap-2">
            <Gear size={28} />
            Pengaturan
          </Title>
        </div>

        <div className="grid gap-6">
          <Card title="Pengaturan Umum">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                siteName: "DataBook Admin",
                siteDescription: "Panel administrasi DataBook",
                maintenanceMode: false,
                emailNotifications: true,
                darkMode: false,
              }}
            >
              <Form.Item
                name="siteName"
                label="Nama Situs"
                rules={[{ required: true, message: "Nama situs wajib diisi!" }]}
              >
                <Input placeholder="Masukkan nama situs" />
              </Form.Item>

              <Form.Item name="siteDescription" label="Deskripsi Situs">
                <TextArea rows={3} placeholder="Masukkan deskripsi situs" />
              </Form.Item>

              <Divider />

              <Form.Item
                name="maintenanceMode"
                label="Mode Maintenance"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="emailNotifications"
                label="Notifikasi Email"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="darkMode"
                label="Mode Gelap"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<FloppyDisk size={16} />}
                  >
                    Simpan Pengaturan
                  </Button>
                  <Button htmlType="button" onClick={() => form.resetFields()}>
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Pengaturan Keamanan">
            <Form layout="vertical">
              <Form.Item
                name="currentPassword"
                label="Password Saat Ini"
                rules={[
                  { required: true, message: "Password saat ini wajib diisi!" },
                ]}
              >
                <Input.Password placeholder="Masukkan password saat ini" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Password Baru"
                rules={[
                  { required: true, message: "Password baru wajib diisi!" },
                  { min: 6, message: "Password minimal 6 karakter!" },
                ]}
              >
                <Input.Password placeholder="Masukkan password baru" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Konfirmasi Password Baru"
                rules={[
                  {
                    required: true,
                    message: "Konfirmasi password wajib diisi!",
                  },
                ]}
              >
                <Input.Password placeholder="Konfirmasi password baru" />
              </Form.Item>

              <Form.Item>
                <Button type="primary">Ubah Password</Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
