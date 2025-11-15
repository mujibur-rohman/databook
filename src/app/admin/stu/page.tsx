"use client";

import { useState, useEffect } from "react";

import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Select,
  Tag,
  message,
  Tooltip,
} from "antd";
import {
  Truck,
  MagnifyingGlass,
  FunnelSimple,
  FileArrowDown,
} from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

interface Branch {
  id: number;
  name: string;
  code: string;
}

interface Type {
  id: number;
  name: string;
  code: string;
}

interface Series {
  id: number;
  name: string;
}

interface StuData {
  id: number;
  machineNumber: string | null;
  rangkaNumber: string | null;
  quantity: number | null;
  date: string | null;
  branchId: number;
  typeId: number;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
  type: Type;
  series: Series;
}

interface ApiResponse {
  data: StuData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function StuPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StuData[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBranchId, setFilterBranchId] = useState<string>("");
  const [filterTypeId, setFilterTypeId] = useState<string>("");

  // Fetch data
  const fetchData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    search = searchText,
    sort = sortBy,
    order = sortOrder,
    branchId = filterBranchId,
    typeId = filterTypeId
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy: sort,
        sortOrder: order,
      });

      if (branchId) params.append("branchId", branchId);
      if (typeId) params.append("typeId", typeId);

      const response = await fetch(`/api/stu?${params}`, {
        credentials: "include",
      });

      if (response.ok) {
        const result: ApiResponse = await response.json();
        setData(result.data);
        setPagination((prev) => ({
          ...prev,
          current: result.pagination.page,
          total: result.pagination.total,
        }));
      } else {
        message.error("Gagal mengambil data STU");
      }
    } catch {
      message.error("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches and types
  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/branches?limit=100", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        setBranches(result.data);
      }
    } catch {
      console.error("Failed to fetch branches");
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch("/api/types?limit=100", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        setTypes(result.data);
      }
    } catch {
      console.error("Failed to fetch types");
    }
  };

  useEffect(() => {
    fetchData();
    fetchBranches();
    fetchTypes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Event handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTableChange = (pag: any, _filters: any, sorter: any) => {
    const newSortBy = sorter.field || "createdAt";
    const newSortOrder = sorter.order === "ascend" ? "asc" : "desc";

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination((prev) => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));

    fetchData(
      pag.current,
      pag.pageSize,
      searchText,
      newSortBy,
      newSortOrder,
      filterBranchId,
      filterTypeId
    );
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(
      1,
      pagination.pageSize,
      value,
      sortBy,
      sortOrder,
      filterBranchId,
      filterTypeId
    );
  };

  const handleBranchFilter = (value: string) => {
    setFilterBranchId(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(
      1,
      pagination.pageSize,
      searchText,
      sortBy,
      sortOrder,
      value,
      filterTypeId
    );
  };

  const handleTypeFilter = (value: string) => {
    setFilterTypeId(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(
      1,
      pagination.pageSize,
      searchText,
      sortBy,
      sortOrder,
      filterBranchId,
      value
    );
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterBranchId("");
    setFilterTypeId("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, "", sortBy, sortOrder, "", "");
  };

  // Import and Export handlers
  const handleImportData = () => {
    console.log("🚀 Import STU Data - Feature Development");
    message.info(
      "Import feature akan segera hadir. Lihat console untuk struktur data yang diharapkan."
    );

    const exampleData = [
      {
        "Machine Number": "YZF1501234567890",
        "Rangka Number": "MH3JKE12345678901",
        Quantity: 1,
        Date: "2024-01-15",
        "Branch Code": "SMA-YMH-LBM",
        "Type Name": "XMAX TECH MAX",
      },
    ];

    console.group("📋 STU Data Import Structure");
    console.table(exampleData[0]);
    console.log("📊 Total Sample Records:", exampleData.length);
    console.log("🔗 API Endpoint: POST /api/stu (coming soon)");
    console.groupEnd();
  };

  const handleExportData = () => {
    console.log("📤 Export STU Data");
    console.table(data.slice(0, 10));
    console.log(`📊 Total Records: ${data.length}`);
    message.success(`Export ${data.length} records to console`);
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: 60,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (_: unknown, __: unknown, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Machine Number",
      dataIndex: "machineNumber",
      key: "machineNumber",
      sorter: true,
      width: 180,
      render: (machineNo: string | null) =>
        machineNo ? (
          <Tooltip title={machineNo}>
            <Text code className="text-xs">
              {machineNo}
            </Text>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Rangka Number",
      dataIndex: "rangkaNumber",
      key: "rangkaNumber",
      width: 180,
      render: (rangkaNo: string | null) =>
        rangkaNo ? (
          <Tooltip title={rangkaNo}>
            <Text code className="text-xs">
              {rangkaNo}
            </Text>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: true,
      width: 100,
      align: "center" as const,
      render: (quantity: number | null) => <Text strong>{quantity || 0}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: true,
      width: 120,
      render: (date: string | null) =>
        date ? <Text>{dayjs(date).format("DD/MM/YYYY")}</Text> : "-",
    },
    {
      title: "Branch",
      key: "branch",
      width: 150,
      render: (record: StuData) => (
        <div>
          <Text strong>{record.branch.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.branch.code}
          </Text>
        </div>
      ),
    },
    {
      title: "Type",
      key: "type",
      render: (record: StuData) => <Tag color="blue">{record.type.name}</Tag>,
    },
    {
      title: "Series",
      key: "series",
      render: (record: StuData) => (
        <Tag color="green">{record.series.name}</Tag>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2 flex items-center gap-2">
              <Truck size={28} />
              STU Data
            </Title>
            <Text type="secondary">Surat Transfer Unit</Text>
          </div>
        </div>

        {/* Summary Statistics */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.length}
                </div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Quantity</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(data.map((item) => item.branchId)).size}
                </div>
                <div className="text-sm text-gray-600">Active Branches</div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="mb-4 space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
              <Search
                placeholder="Cari machine number, rangka number..."
                prefix={<MagnifyingGlass size={16} />}
                onSearch={handleSearch}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />

              <Select
                placeholder="Filter Branch"
                value={filterBranchId || undefined}
                onChange={handleBranchFilter}
                style={{ width: 180 }}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {branches.map((branch) => (
                  <Select.Option key={branch.id} value={branch.id.toString()}>
                    {branch.name} ({branch.code})
                  </Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Filter Type"
                value={filterTypeId || undefined}
                onChange={handleTypeFilter}
                style={{ width: 150 }}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {types.map((type) => (
                  <Select.Option key={type.id} value={type.id.toString()}>
                    {type.name}
                  </Select.Option>
                ))}
              </Select>

              <Space>
                <Button onClick={handleImportData} type="primary">
                  Import Data (Console)
                </Button>
                <Tooltip title="Export current data to console">
                  <Button
                    onClick={handleExportData}
                    icon={<FileArrowDown size={16} />}
                    disabled={data.length === 0}
                  >
                    Export ({data.length})
                  </Button>
                </Tooltip>
              </Space>
            </div>

            <div className="flex justify-between items-center">
              <Space>
                <Button
                  icon={<FunnelSimple size={16} />}
                  onClick={clearFilters}
                  type="default"
                >
                  Clear Filters
                </Button>
                <Text type="secondary">
                  {pagination.total > 0
                    ? `Showing ${
                        (pagination.current - 1) * pagination.pageSize + 1
                      }-${Math.min(
                        pagination.current * pagination.pageSize,
                        pagination.total
                      )} of ${pagination.total} records`
                    : "No records found"}
                </Text>
              </Space>
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            size="small"
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
