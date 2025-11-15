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
  Badge,
} from "antd";
import {
  Archive,
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

interface ShoData {
  id: number;
  category: string | null;
  color: string | null;
  location: string | null;
  quantity: number | null;
  dateGrn: string | null;
  rangkaNumber: string | null;
  year: string | null;
  positionStock: string | null;
  status: string | null;
  count: number | null;
  umurStock: number | null;
  umurMutasi: number | null;
  sourceDoc: string | null;
  sourceBranch: string | null;
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
  data: ShoData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ShoPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ShoData[]>([]);
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
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Fetch data
  const fetchData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    search = searchText,
    sort = sortBy,
    order = sortOrder,
    branchId = filterBranchId,
    typeId = filterTypeId,
    status = filterStatus
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
      if (status) params.append("status", status);

      const response = await fetch(`/api/sho?${params}`, {
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
        message.error("Gagal mengambil data SHO");
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
      filterTypeId,
      filterStatus
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
      filterTypeId,
      filterStatus
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
      filterTypeId,
      filterStatus
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
      value,
      filterStatus
    );
  };

  const handleStatusFilter = (value: string) => {
    setFilterStatus(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(
      1,
      pagination.pageSize,
      searchText,
      sortBy,
      sortOrder,
      filterBranchId,
      filterTypeId,
      value
    );
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterBranchId("");
    setFilterTypeId("");
    setFilterStatus("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, "", sortBy, sortOrder, "", "", "");
  };

  // Import and Export handlers
  const handleImportData = () => {
    console.log("🚀 Import SHO Data - Feature Development");
    message.info(
      "Import feature akan segera hadir. Lihat console untuk struktur data yang diharapkan."
    );

    const exampleData = [
      {
        Category: "Motor",
        Color: "Red",
        Location: "Gudang A",
        Quantity: 5,
        "Date GRN": "2024-01-15",
        "Rangka Number": "MH3JKE12345678901",
        Year: "2024",
        "Position Stock": "Available",
        Status: "Active",
        Count: 5,
        "Umur Stock": 30,
        "Umur Mutasi": 15,
        "Source Doc": "GRN001",
        "Source Branch": "Main Store",
        Date: "2024-01-15",
        "Branch Code": "SMA-YMH-LBM",
        "Type Name": "XMAX TECH MAX",
      },
    ];

    console.group("📋 SHO Data Import Structure");
    console.table(exampleData[0]);
    console.log("📊 Total Sample Records:", exampleData.length);
    console.log("🔗 API Endpoint: POST /api/sho (coming soon)");
    console.groupEnd();
  };

  const handleExportData = () => {
    console.log("📤 Export SHO Data");
    console.table(data.slice(0, 10));
    console.log(`📊 Total Records: ${data.length}`);
    message.success(`Export ${data.length} records to console`);
  };

  // Helper function for stock age color
  const getStockAgeColor = (umurStock: number | null) => {
    if (!umurStock) return "default";
    if (umurStock > 90) return "red";
    if (umurStock > 60) return "orange";
    if (umurStock > 30) return "yellow";
    return "green";
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
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (category: string | null) => category || "-",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: 120,
      render: (location: string | null) => location || "-",
    },
    {
      title: "Rangka Number",
      dataIndex: "rangkaNumber",
      key: "rangkaNumber",
      width: 160,
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
      title: "Color",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (color: string | null) =>
        color ? <Tag color="cyan">{color}</Tag> : "-",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      width: 80,
      align: "center" as const,
      render: (year: string | null) => year || "-",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      sorter: true,
      width: 80,
      align: "center" as const,
      render: (quantity: number | null) => (
        <Badge count={quantity || 0} color="blue" showZero />
      ),
    },
    {
      title: "Stock Age",
      dataIndex: "umurStock",
      key: "umurStock",
      sorter: true,
      width: 100,
      align: "center" as const,
      render: (umurStock: number | null) => {
        if (!umurStock) return "-";
        return <Tag color={getStockAgeColor(umurStock)}>{umurStock} days</Tag>;
      },
    },
    {
      title: "Position",
      dataIndex: "positionStock",
      key: "positionStock",
      width: 120,
      render: (position: string | null) => position || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string | null) => {
        if (!status) return "-";
        const color =
          status === "Active"
            ? "green"
            : status === "Inactive"
            ? "red"
            : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "GRN Date",
      dataIndex: "dateGrn",
      key: "dateGrn",
      sorter: true,
      width: 120,
      render: (date: string | null) =>
        date ? (
          <Text className="text-xs">{dayjs(date).format("DD/MM/YY")}</Text>
        ) : (
          "-"
        ),
    },
    {
      title: "Source",
      key: "source",
      width: 150,
      render: (record: ShoData) => (
        <div>
          <Text className="text-xs">{record.sourceDoc || "-"}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.sourceBranch || "-"}
          </Text>
        </div>
      ),
    },
    {
      title: "Branch",
      key: "branch",
      width: 150,
      render: (record: ShoData) => (
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
      render: (record: ShoData) => <Tag color="blue">{record.type.name}</Tag>,
    },
    {
      title: "Series",
      key: "series",
      render: (record: ShoData) => (
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
              <Archive size={28} />
              SHO Data
            </Title>
            <Text type="secondary">Stock Harian Outlet</Text>
          </div>
        </div>

        {/* Summary Statistics */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <div className="text-sm text-gray-600">Total Stock</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(
                    data.reduce((sum, item) => sum + (item.umurStock || 0), 0) /
                      data.length
                  ) || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Stock Age</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.filter((item) => (item.umurStock || 0) > 90).length}
                </div>
                <div className="text-sm text-gray-600">Old Stock (90+)</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.filter((item) => item.status === "Active").length}
                </div>
                <div className="text-sm text-gray-600">Active Stock</div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="mb-4 space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
              <Search
                placeholder="Cari category, location, rangka number..."
                prefix={<MagnifyingGlass size={16} />}
                onSearch={handleSearch}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 350 }}
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

              <Select
                placeholder="Filter Status"
                value={filterStatus || undefined}
                onChange={handleStatusFilter}
                style={{ width: 120 }}
                allowClear
              >
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
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
            scroll={{ x: 1800 }}
            size="small"
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
