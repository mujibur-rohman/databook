"use client";

import { Button, Card, Form, Input, Typography, message } from "antd";
import { UserCircle, Lock } from "@phosphor-icons/react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);

    try {
      const success = await login(values.username, values.password);

      if (success) {
        message.success("Login berhasil!");
        // Redirect is handled by AuthContext
      } else {
        message.error("Username atau password salah!");
      }
    } catch {
      message.error("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={2} className="mb-2">
            Login Admin
          </Title>
          <Text type="secondary">
            Silakan masukkan username dan password Anda
          </Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Username tidak boleh kosong!" },
              { min: 3, message: "Username minimal 3 karakter!" },
            ]}
          >
            <Input
              prefix={<UserCircle size={20} />}
              placeholder="Masukkan username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Password tidak boleh kosong!" },
              { min: 6, message: "Password minimal 6 karakter!" },
            ]}
          >
            <Input.Password
              prefix={<Lock size={20} />}
              placeholder="Masukkan password"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
              size="large"
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6 text-center">
          <Text type="secondary" className="text-sm">
            Demo: username: <strong>admin</strong>, password:{" "}
            <strong>admin123</strong>
          </Text>
        </div>
      </Card>
    </div>
  );
}
