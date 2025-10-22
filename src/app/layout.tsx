import QueryProvider from "@/providers/query-provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import AntdProvider from "@/providers/antd-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Your App",
  description: "Description your app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthProvider>
          <QueryProvider>
            <AntdRegistry>
              <AntdProvider>
                <NextTopLoader />
                <div>{children}</div>
                <Toaster richColors position="top-right" theme="light" />
              </AntdProvider>
            </AntdRegistry>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
