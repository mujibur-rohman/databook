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
import { FileText, MagnifyingGlass, FunnelSimple, FileArrowDown } from "@phosphor-icons/react";
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

interface DoPenjualanData {
  id: number;
  soNumber: string | null;
  soDate: string | null;
  soState: string | null;
  cashOrCredit: string | null;
  top: string | null;
  customerCode: string | null;
  customerName: string | null;
  ktp: string | null;
  alamat: string | null;
  kota: string | null;
  kecamatan: string | null;
  birthday: string | null;
  phoneNumber: string | null;
  pos: string | null;
  color: string | null;
  quantity: number | null;
  year: string | null;
  engineNumber: string | null;
  chassisNumber: string | null;
  productCategory: string | null;
  salesPic: string | null;
  salesForce: string | null;
  jabatanSalesForce: string | null;
  mainDealer: string | null;
  salesSource: string | null;
  sourceDocument: string | null;
  jpPo: number | null;
  tenor: number | null;
  branchId: number;
  typeId: number;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
  type: Type;
  series: Series;
}

interface ApiResponse {
  data: DoPenjualanData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DoPenjualanPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DoPenjualanData[]>([]);
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
  const [filterCashOrCredit, setFilterCashOrCredit] = useState<string>("");

  // Fetch data
  const fetchData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    search = searchText,
    sort = sortBy,
    order = sortOrder,
    branchId = filterBranchId,
    typeId = filterTypeId,
    cashOrCredit = filterCashOrCredit
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
      if (cashOrCredit) params.append("cashOrCredit", cashOrCredit);

      const response = await fetch(`/api/do-penjualan?${params}`, {
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
        message.error("Gagal mengambil data DO Penjualan");
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
      filterCashOrCredit
    );
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, value, sortBy, sortOrder, filterBranchId, filterTypeId, filterCashOrCredit);
  };

  const handleBranchFilter = (value: string) => {
    setFilterBranchId(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, searchText, sortBy, sortOrder, value, filterTypeId, filterCashOrCredit);
  };

  const handleTypeFilter = (value: string) => {
    setFilterTypeId(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, searchText, sortBy, sortOrder, filterBranchId, value, filterCashOrCredit);
  };

  const handleCashOrCreditFilter = (value: string) => {
    setFilterCashOrCredit(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, searchText, sortBy, sortOrder, filterBranchId, filterTypeId, value);
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterBranchId("");
    setFilterTypeId("");
    setFilterCashOrCredit("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, "", sortBy, sortOrder, "", "", "");
  };

  // Import and Export handlers
  const handleImportData = () => {
    console.log("🚀 Import DO Penjualan Data - Feature Development");
    message.info("Import feature akan segera hadir. Lihat console untuk struktur data yang diharapkan.");
    
    const exampleData = [
      {
        "SO Number": "SO001/2024",
        "SO Date": "2024-01-15",
        "SO State": "Confirmed",
        "Cash or Credit": "Credit",
        "TOP": "30 Days",
        "Customer Code": "CUST001",
        "Customer Name": "John Doe",
        "KTP": "3201234567890123",
        "Alamat": "Jl. Sudirman No. 123",
        "Kota": "Jakarta",
        "Kecamatan": "Menteng",
        "Birthday": "1990-01-01",
        "Phone Number": "081234567890",
        "POS": "Sales Counter",
        "Color": "Red",
        "Quantity": 1,
        "Year": "2024",
        "Engine Number": "ENG123456789",
        "Chassis Number": "CHS987654321",
        "Product Category": "Motor",
        "Sales PIC": "Ahmad",
        "Sales Force": "Team A",
        "Jabatan Sales Force": "Sales Executive",
        "Main Dealer": "PT Main Dealer",
        "Sales Source": "Walk In",
        "Source Document": "Manual",
        "JP PO": 500000,
        "Tenor": 24,
        "Branch Code": "SMA-YMH-LBM",
        "Type Name": "XMAX TECH MAX",
      }
    ];
    
    console.group("📋 DO Penjualan Data Import Structure");
    console.table(exampleData[0]);
    console.log("📊 Total Sample Records:", exampleData.length);
    console.log("🔗 API Endpoint: POST /api/do-penjualan (coming soon)");
    console.groupEnd();
  };

  const handleExportData = () => {
    console.log("📤 Export DO Penjualan Data");
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
      title: "SO Number",
      dataIndex: "soNumber",
      key: "soNumber",
      sorter: true,
      width: 150,
      render: (soNumber: string | null) => soNumber || "-",
    },
    {
      title: "SO Date",
      dataIndex: "soDate",
      key: "soDate",
      sorter: true,
      width: 120,
      render: (date: string | null) => 
        date ? <Text>{dayjs(date).format("DD/MM/YYYY")}</Text> : "-",
    },
    {
      title: "Customer",
      key: "customer",
      width: 200,
      render: (record: DoPenjualanData) => (
        <div>
          <Text strong>{record.customerName || "-"}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.customerCode || "-"}
          </Text>
        </div>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      width: 120,
      render: (record: DoPenjualanData) => {
        const color = record.cashOrCredit === "Cash" ? "green" : 
                    record.cashOrCredit === "Credit" ? "blue" : "default";
        return <Tag color={color}>{record.cashOrCredit || "-"}</Tag>;
      },
    },
    {
      title: "Contact",
      key: "contact",
      width: 150,
      render: (record: DoPenjualanData) => (
        <div>
          <Text className="text-xs">{record.phoneNumber || "-"}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.kota || "-"}
          </Text>
        </div>
      ),
    },
    {
      title: "Engine/Chassis",
      key: "numbers",
      width: 180,
      render: (record: DoPenjualanData) => (
        <div>
          <Tooltip title={record.engineNumber}>
            <Text code className="text-xs block">E: {record.engineNumber?.slice(-8) || "-"}</Text>
          </Tooltip>
          <Tooltip title={record.chassisNumber}>
            <Text code className="text-xs">C: {record.chassisNumber?.slice(-8) || "-"}</Text>
          </Tooltip>
        </div>
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
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      sorter: true,
      width: 80,
      align: "center" as const,
      render: (quantity: number | null) => quantity || 0,
    },
    {
      title: "Sales PIC",
      dataIndex: "salesPic",
      key: "salesPic",
      width: 120,
      render: (salesPic: string | null) => salesPic || "-",
    },
    {
      title: "Branch",
      key: "branch",
      width: 150,
      render: (record: DoPenjualanData) => (
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
      render: (record: DoPenjualanData) => (
        <Tag color="blue">{record.type.name}</Tag>
      ),
    },
    {
      title: "Series",
      key: "series",
      render: (record: DoPenjualanData) => (
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
              <FileText size={28} />
              DO Penjualan Data
            </Title>
          </div>
        </div>

        {/* Summary Statistics */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  {data.filter(item => item.cashOrCredit === "Cash").length}
                </div>
                <div className="text-sm text-gray-600">Cash Sales</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.filter(item => item.cashOrCredit === "Credit").length}
                </div>
                <div className="text-sm text-gray-600">Credit Sales</div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="mb-4 space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
              <Search
                placeholder="Cari SO number, customer, engine number..."
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
                placeholder="Payment Type"
                value={filterCashOrCredit || undefined}
                onChange={handleCashOrCreditFilter}
                style={{ width: 130 }}
                allowClear
              >
                <Select.Option value="Cash">Cash</Select.Option>
                <Select.Option value="Credit">Credit</Select.Option>
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
            scroll={{ x: 1600 }}
            size="small"
          />
        </Card>
      </div>
    </AdminLayout>
  );
}