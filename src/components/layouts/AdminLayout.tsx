"use client";

import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Avatar,
  Dropdown,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  House,
  Database,
  Users,
  Package,
  Gear,
  List,
  SignOut,
  User,
  CaretDown,
} from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface User {
  username: string;
  role: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    message.success("Logout berhasil!");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <House size={18} />,
      label: "Dashboard",
      onClick: () => router.push("/admin/dashboard"),
    },
    {
      key: "master-data",
      icon: <Database size={18} />,
      label: "Master Data",
      children: [
        {
          key: "users",
          icon: <Users size={16} />,
          label: "Pengguna",
          onClick: () => router.push("/admin/master-data/users"),
        },
        {
          key: "products",
          icon: <Package size={16} />,
          label: "Produk",
          onClick: () => router.push("/admin/master-data/products"),
        },
        {
          key: "categories",
          icon: <List size={16} />,
          label: "Kategori",
          onClick: () => router.push("/admin/master-data/categories"),
        },
      ],
    },
    {
      key: "settings",
      icon: <Gear size={18} />,
      label: "Pengaturan",
      onClick: () => router.push("/admin/settings"),
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: "Profile",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <SignOut size={16} />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  // Get current selected keys based on pathname
  const getSelectedKeys = () => {
    if (pathname === "/admin/dashboard") return ["dashboard"];
    if (pathname.includes("/admin/master-data/users")) return ["users"];
    if (pathname.includes("/admin/master-data/products")) return ["products"];
    if (pathname.includes("/admin/master-data/categories"))
      return ["categories"];
    if (pathname.includes("/admin/settings")) return ["settings"];
    return [];
  };

  const getOpenKeys = () => {
    if (pathname.includes("/admin/master-data/")) return ["master-data"];
    return [];
  };

  if (!user) {
    return null; // Loading state while checking auth
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
        className="bg-white shadow-lg"
        width={256}
      >
        <div className="p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Database size={20} className="text-white" />
            </div>
            {!collapsed && (
              <div>
                <Title level={5} className="mb-0 text-gray-800">
                  DataBook
                </Title>
                <Text type="secondary" className="text-xs">
                  Admin Panel
                </Text>
              </div>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          className="border-r-0 h-full"
        />
      </Sider>

      <Layout>
        <Header className="!bg-white shadow-sm !px-4 flex justify-between items-center">
          <Button
            type="text"
            icon={<List size={18} />}
            onClick={() => setCollapsed(!collapsed)}
            className="lg:hidden"
          />

          <div className="flex-1" />

          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: ({ key }) => {
                if (key === "logout") {
                  handleLogout();
                }
              },
            }}
            trigger={["click"]}
          >
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar size="small" className="bg-blue-500">
                {user?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div className="hidden sm:block">
                <Text className="text-sm font-medium">{user?.username}</Text>
              </div>
              <CaretDown size={12} />
            </div>
          </Dropdown>
        </Header>

        <Content className="p-6 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}
