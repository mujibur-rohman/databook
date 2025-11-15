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
  Package,
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

interface SupplyData {
  id: number;
  supplier: string | null;
  sjSupplier: string | null;
  bpb: string | null;
  color: string | null;
  status: string | null;
  machineNumber: string | null;
  rangkaNumber: string | null;
  price: number | null;
  discount: number | null;
  apUnit: number | null;
  quantity: number | null;
  faktur: string | null;
  fakturDate: string | null;
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
  data: SupplyData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SupplyPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SupplyData[]>([]);
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

  // Fetch supply data
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

      if (branchId) {
        params.append("branchId", branchId);
      }

      if (typeId) {
        params.append("typeId", typeId);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await fetch(`/api/supply?${params}`, {
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
        message.error("Gagal mengambil data supply");
      }
    } catch {
      message.error("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches for filter
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

  // Fetch types for filter
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

  // Handle export data
  const handleExportData = () => {
    console.log("📤 Export Supply Data");
    message.info(
      "Export feature akan segera hadir. Data saat ini akan ditampilkan di console."
    );

    if (data.length === 0) {
      console.log("⚠️ No data to export");
      return;
    }

    console.group("📊 Current Supply Data Export");
    console.table(
      data.map((item) => ({
        ID: item.id,
        Supplier: item.supplier || "-",
        "SJ Supplier": item.sjSupplier || "-",
        BPB: item.bpb || "-",
        Color: item.color || "-",
        Status: item.status || "-",
        "Machine Number": item.machineNumber || "-",
        "Rangka Number": item.rangkaNumber || "-",
        Price: item.price || 0,
        Discount: item.discount || 0,
        "AP Unit": item.apUnit || 0,
        Quantity: item.quantity || 0,
        Faktur: item.faktur || "-",
        "Faktur Date": item.fakturDate || "-",
        Date: item.date || "-",
        Branch: item.branch.name,
        "Branch Code": item.branch.code,
        Type: item.type.name,
        Series: item.series.name,
      }))
    );
    console.groupEnd();

    const totalValue = data.reduce((sum, item) => sum + (item.apUnit || 0), 0);
    console.log(`💰 Total Export Value: ${formatCurrency(totalValue)}`);
  };

  // Handle import data (log to console for now)
  const handleImportData = () => {
    console.log("🚀 Import Supply Data - Feature Development");
    message.info(
      "Import feature akan segera hadir. Lihat console untuk struktur data yang diharapkan."
    );

    // Example data structure for supply import
    const exampleSupplyData = [
      {
        supplier: "PT Supplier ABC",
        sjSupplier: "SJ001/2024",
        bpb: "BPB001/2024",
        color: "Merah Metalik",
        status: "Available",
        machineNumber: "YZF1501234567890",
        rangkaNumber: "MH3JKE12345678901",
        price: 15000000,
        discount: 500000,
        apUnit: 14500000,
        quantity: 1,
        faktur: "FKT001/2024",
        fakturDate: "2024-01-15",
        date: "2024-01-15",
        branchCode: "SMA-YMH-LBM", // Will be mapped to branch ID
        typeName: "XMAX TECH MAX", // Will be mapped to type ID
      },
      {
        supplier: "PT Supplier XYZ",
        sjSupplier: "SJ002/2024",
        bpb: "BPB002/2024",
        color: "Hitam Doff",
        status: "Sold",
        machineNumber: "YZF1509876543210",
        rangkaNumber: "MH3JKE09876543210",
        price: 16500000,
        discount: 750000,
        apUnit: 15750000,
        quantity: 1,
        faktur: "FKT002/2024",
        fakturDate: "2024-01-20",
        date: "2024-01-20",
        branchCode: "SMA-YMH-LBM",
        typeName: "NMAX TECH MAX",
      },
    ];

    console.group("📋 Supply Data Import Structure");
    console.log("Expected CSV/Excel columns:");
    console.table({
      Supplier: "PT Supplier ABC",
      "SJ Supplier": "SJ001/2024",
      BPB: "BPB001/2024",
      Color: "Merah Metalik",
      Status: "Available|Sold|Reserved",
      "Machine Number": "YZF1501234567890",
      "Rangka Number": "MH3JKE12345678901",
      Price: "15000000",
      Discount: "500000",
      "AP Unit": "14500000",
      Quantity: "1",
      Faktur: "FKT001/2024",
      "Faktur Date": "2024-01-15",
      Date: "2024-01-15",
      "Branch Code": "SMA-YMH-LBM",
      "Type Name": "XMAX TECH MAX",
    });
    console.log("Example data:");
    console.table(exampleSupplyData);
    console.groupEnd();

    // Show summary statistics
    const totalValue = exampleSupplyData.reduce(
      (sum, item) => sum + (item.apUnit || 0),
      0
    );
    const totalQuantity = exampleSupplyData.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    console.log(`💰 Total Value: ${formatCurrency(totalValue)}`);
    console.log(`📦 Total Quantity: ${totalQuantity} units`);
    console.log("🔗 API Endpoint: POST /api/supply (coming soon)");
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      sorter: true,
      width: 150,
      render: (supplier: string | null) => supplier || "-",
    },
    {
      title: "SJ Supplier",
      dataIndex: "sjSupplier",
      key: "sjSupplier",
      width: 120,
      render: (sj: string | null) => sj || "-",
    },
    {
      title: "BPB",
      dataIndex: "bpb",
      key: "bpb",
      width: 100,
      render: (bpb: string | null) => bpb || "-",
    },
    {
      title: "Machine No",
      dataIndex: "machineNumber",
      key: "machineNumber",
      width: 150,
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
      title: "Rangka No",
      dataIndex: "rangkaNumber",
      key: "rangkaNumber",
      width: 150,
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string | null) => {
        if (!status) return "-";
        const color =
          status === "Available"
            ? "green"
            : status === "Sold"
            ? "red"
            : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: true,
      width: 100,
      align: "right" as const,
      render: (quantity: number | null) =>
        quantity ? <Text strong>{quantity.toLocaleString("id-ID")}</Text> : "-",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: true,
      width: 150,
      align: "right" as const,
      render: (price: number | null) => (
        <Text strong>{formatCurrency(price)}</Text>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      width: 120,
      align: "right" as const,
      render: (discount: number | null) => formatCurrency(discount),
    },
    {
      title: "Net Price",
      key: "netPrice",
      width: 150,
      align: "right" as const,
      render: (record: SupplyData) => {
        const netPrice = (record.price || 0) - (record.discount || 0);
        return (
          <Tooltip
            title={`${formatCurrency(record.price)} - ${formatCurrency(
              record.discount
            )}`}
          >
            <Text strong className="text-orange-600">
              {formatCurrency(netPrice)}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: "AP Unit",
      dataIndex: "apUnit",
      key: "apUnit",
      width: 150,
      align: "right" as const,
      render: (apUnit: number | null) => (
        <Text strong className="text-green-600">
          {formatCurrency(apUnit)}
        </Text>
      ),
    },
    {
      title: "Faktur",
      dataIndex: "faktur",
      key: "faktur",
      width: 120,
      render: (faktur: string | null) => faktur || "-",
    },
    {
      title: "Faktur Date",
      dataIndex: "fakturDate",
      key: "fakturDate",
      sorter: true,
      width: 120,
      render: (date: string | null) =>
        date ? <Text>{dayjs(date).format("DD/MM/YYYY")}</Text> : "-",
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
      render: (record: SupplyData) => (
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
      render: (record: SupplyData) => (
        <Tag color="blue">{record.type.name}</Tag>
      ),
    },
    {
      title: "Series",
      key: "series",
      render: (record: SupplyData) => (
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
              <Package size={28} />
              Supply Data
            </Title>
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
                <div className="text-sm text-gray-600">Total Quantity</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(
                    data.reduce((sum, item) => sum + (item.price || 0), 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Gross Price</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(
                    data.reduce((sum, item) => sum + (item.discount || 0), 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Discount</div>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {formatCurrency(
                    data.reduce((sum, item) => sum + (item.apUnit || 0), 0)
                  )}
                </div>
                <div className="text-sm text-gray-600">Total AP Unit</div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <div className="mb-4 space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
              <Search
                placeholder="Cari supplier, machine number, rangka number, faktur..."
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
                style={{ width: 130 }}
                allowClear
              >
                <Select.Option value="Available">Available</Select.Option>
                <Select.Option value="Sold">Sold</Select.Option>
                <Select.Option value="Reserved">Reserved</Select.Option>
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
