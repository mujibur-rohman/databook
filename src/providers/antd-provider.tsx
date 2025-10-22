"use client";
import { ConfigProvider } from "antd";

function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0B5FD8",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default AntdProvider;
