import QueryProvider from "@/providers/query-provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import AntdProvider from "@/providers/antd-provider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "DataBook Admin",
    template: "%s | DataBook Admin",
  },
  description:
    "Comprehensive admin dashboard for managing master data including series, branches, and types with advanced search and CRUD operations",
  keywords: [
    "admin",
    "dashboard",
    "master data",
    "CRUD",
    "management",
    "series",
    "branches",
    "types",
    "database",
    "postgresql",
    "nextjs",
  ],
  authors: [{ name: "DataBook Team", url: "https://databook-admin.com" }],
  creator: "DataBook Development Team",
  publisher: "DataBook",
  applicationName: "DataBook Admin",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#1890ff",
  colorScheme: "light",
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
