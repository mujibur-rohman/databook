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
  Spin,
  Modal,
} from "antd";
import { Archive, MagnifyingGlass, FunnelSimple } from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";
import dayjs from "dayjs";
import ImportData from "@/components/ImportData";
import { toast } from "sonner";
import { excelDateToJSDate } from "@/lib/date";

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

interface CsvDataRow {
  "Branch Name": string;
  "Branch Code": string;
  Kategori: string;
  "Kode Unit": string;
  Type: string;
  Warna: string;
  Lokasi: string;
  "No Mesin": string;
  "No Rangka": string;
  "Tahun Rakit": number;
  QTY: string;
  "Posisi Stock": string;
  Status: string;
  "Umur Stock / (hari)": string;
  "Umur Mutasi / (hari)": string;
  "Source Doc": string;
  "Source Branch": string;
  Tanggal: number;
  Series: string;
}

interface ImportApiResponse {
  message: string;
  successCount: number;
  errorCount: number;
  results: Array<{
    index: number;
    data: ShoData;
    success: boolean;
  }>;
  errors: ImportError[];
}

interface ImportError {
  index: number;
  error: string;
  data?: CsvDataRow;
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
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errorCount: number;
    errors: ImportError[];
    successfulIds?: number[];
    rollbackMessage?: string;
  } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [openImport, setOpenImport] = useState(false);

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

  const transformCsvDataToApiFormat = (csvData: CsvDataRow[]) => {
    return csvData.map((row, index) => {
      try {
        return {
          category: row.Kategori || "",
          color: row.Warna || "",
          location: row.Lokasi || "",
          quantity: parseInt(row.QTY?.toString()) || 0,
          rangkaNumber: row["No Rangka"] || "",
          year: row["Tahun Rakit"]?.toString() || "",
          positionStock: row["Posisi Stock"] || "",
          status: row.Status || "",
          umurStock: parseInt(row["Umur Stock / (hari)"]?.toString()) || null,
          umurMutasi: parseInt(row["Umur Mutasi / (hari)"]?.toString()) || null,
          sourceDoc: row["Source Doc"] || "",
          sourceBranch: row["Source Branch"] || "",
          date: excelDateToJSDate(row.Tanggal),
          branchCode: row["Branch Code"] || "",
          typeName: row["Kode Unit"] || "",
          originalRowIndex: index,
        };
      } catch (error) {
        console.error(`Error transforming row ${index}:`, error);
        return {
          branchCode: "",
          typeName: "",
          originalRowIndex: index,
        };
      }
    });
  };

  // Handle rollback/undo import with confirmation
  const handleRollbackImport = async () => {
    if (
      !importResult?.successfulIds ||
      importResult.successfulIds.length === 0
    ) {
      toast.error("Tidak ada data yang bisa di-rollback");
      return;
    }

    Modal.confirm({
      title: "Konfirmasi Rollback",
      content: (
        <div>
          <p>
            Apakah Anda yakin ingin menghapus{" "}
            <strong>{importResult.successCount} data</strong> yang sudah
            berhasil diimport?
          </p>
          <p className="text-red-600 text-sm mt-2">
            ⚠️ Tindakan ini tidak dapat dibatalkan!
          </p>
        </div>
      ),
      okText: "Ya, Rollback",
      cancelText: "Batal",
      okType: "danger",
      onOk: async () => {
        setUndoLoading(true);
        try {
          const response = await fetch("/api/sho/batch-delete", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ ids: importResult.successfulIds }),
          });

          if (response.ok) {
            const result = await response.json();
            toast.success(
              `Berhasil rollback ${result.deletedCount} data yang telah diimport`
            );

            setImportResult((prev) =>
              prev
                ? {
                    ...prev,
                    successCount: 0,
                    successfulIds: [],
                    rollbackMessage: `${
                      result.deletedCount
                    } data berhasil di-rollback pada ${new Date().toLocaleString(
                      "id-ID"
                    )}`,
                  }
                : null
            );

            fetchData();
          } else {
            const error = await response.json();
            toast.error(`Gagal rollback data: ${error.error}`);
          }
        } catch (error) {
          console.error("Rollback error:", error);
          toast.error("Terjadi kesalahan saat rollback data");
        } finally {
          setUndoLoading(false);
        }
      },
    });
  };

  const handleImportConfirm = async (csvData: CsvDataRow[]) => {
    setImportLoading(true);
    setImportResult(null);
    try {
      const transformedData = transformCsvDataToApiFormat(csvData);

      const response = await fetch("/api/sho", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();

      if (response.ok || response.status === 207) {
        // Extract successful IDs for rollback capability
        const successfulIds = result.results
          ? result.results
              .filter((r: ImportApiResponse["results"][0]) => r.success)
              .map((r: ImportApiResponse["results"][0]) => r.data.id)
          : [];

        setImportResult({
          successCount: result.successCount || 0,
          errorCount: result.errorCount || 0,
          errors: result.errors || [],
          successfulIds: successfulIds,
        });

        if (result.successCount > 0) {
          toast.success(
            `Berhasil mengimport ${result.successCount} data dari ${csvData.length} total data`
          );
          // Refresh data table
          fetchData();
        }

        if (result.errorCount > 0) {
          toast.warning(
            `${result.errorCount} data gagal diimport. Silakan lihat detail error di bawah.`
          );
        }
      } else {
        toast.error("Gagal mengimport data");
        setImportResult({
          successCount: 0,
          errorCount: csvData.length,
          errors: [{ index: 0, error: result.error || "Unknown error" }],
          successfulIds: [],
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Terjadi kesalahan saat mengimport data");
      setImportResult({
        successCount: 0,
        errorCount: csvData.length,
        errors: [{ index: 0, error: "Network or server error" }],
        successfulIds: [],
      });
    } finally {
      setImportLoading(false);
      setOpenImport(false);
    }
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

        {/* Import Result Feedback */}
        {importResult && (
          <Card className="mb-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Title level={4}>Hasil Import Data</Title>
                {importResult.rollbackMessage && (
                  <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                    ✅ {importResult.rollbackMessage}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-lg border ${
                    importResult.successCount === 0 &&
                    importResult.successfulIds &&
                    importResult.successfulIds.length === 0
                      ? "bg-gray-50 border-gray-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        importResult.successCount === 0 &&
                        importResult.successfulIds &&
                        importResult.successfulIds.length === 0
                          ? "bg-gray-400"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <Text
                      strong
                      className={
                        importResult.successCount === 0 &&
                        importResult.successfulIds &&
                        importResult.successfulIds.length === 0
                          ? "text-gray-600"
                          : "text-green-700"
                      }
                    >
                      Data Berhasil
                      {importResult.successCount === 0 &&
                        importResult.successfulIds &&
                        importResult.successfulIds.length === 0 &&
                        " (Rolled Back)"}
                    </Text>
                  </div>
                  <div
                    className={`text-2xl font-bold mt-1 ${
                      importResult.successCount === 0 &&
                      importResult.successfulIds &&
                      importResult.successfulIds.length === 0
                        ? "text-gray-600"
                        : "text-green-700"
                    }`}
                  >
                    {importResult.successCount}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <Text strong className="text-red-700">
                      Data Gagal
                    </Text>
                  </div>
                  <div className="text-2xl font-bold text-red-700 mt-1">
                    {importResult.errorCount}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <Text strong className="text-blue-700">
                      Total Diproses
                    </Text>
                  </div>
                  <div className="text-2xl font-bold text-blue-700 mt-1">
                    {importResult.successCount + importResult.errorCount}
                  </div>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Title level={5} className="text-red-600 mb-0">
                      Detail Data yang Gagal:
                    </Title>
                    {importResult.successCount > 0 && (
                      <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                        ⚠️ Ada {importResult.successCount} data yang sudah
                        berhasil diimport
                      </div>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {importResult.errors.map((error, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Text strong className="text-red-700">
                              Baris {error.index + 1}:
                            </Text>
                            <Text className="text-red-600 ml-2">
                              {error.error}
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                {importResult.errorCount > 0 &&
                  importResult.successCount > 0 &&
                  importResult.successfulIds &&
                  importResult.successfulIds.length > 0 && (
                    <Button
                      onClick={handleRollbackImport}
                      loading={undoLoading}
                      danger
                      type="primary"
                    >
                      🔄 Undo & Rollback ({importResult.successCount} data)
                    </Button>
                  )}
                <Button onClick={() => setImportResult(null)} type="default">
                  Tutup Laporan
                </Button>
              </div>
            </div>
          </Card>
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
                <Button
                  onClick={() => {
                    setImportResult(null); // Reset previous results
                    setOpenImport(true);
                  }}
                >
                  Import Data
                </Button>
                <ImportData
                  maxFileSize={30}
                  onCancel={() => setOpenImport(false)}
                  visible={openImport}
                  onConfirmImport={handleImportConfirm}
                  title="Import SHO Data"
                  loadingConfirm={importLoading}
                  templateColumns={[
                    "Cabang",
                    "Kode Cabang",
                    "Kategori",
                    "Kode Unit",
                    "Deskripsi",
                    "Warna",
                    "Lokasi",
                    "Tanggal GRN",
                    "Mesin",
                    "Rangka",
                    "Tahun Rakit",
                    "Jumlah",
                    "Posisi Stock",
                    "Status",
                    "Umur Stock / (hari)",
                    "Umur Mutasi / (hari)",
                    "Source Doc",
                    "Source Branch",
                    "Tanggal",
                    "Series",
                  ]}
                />
                {importLoading && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg">
                      <Spin size="large" />
                      <div className="mt-4">
                        <Text>Sedang memproses import data...</Text>
                      </div>
                    </div>
                  </div>
                )}
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
