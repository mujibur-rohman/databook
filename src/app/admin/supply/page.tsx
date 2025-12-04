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
  Modal,
} from "antd";
import { Package, MagnifyingGlass, FunnelSimple } from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";
import dayjs from "dayjs";
import ImportData from "@/components/ImportData";
import { excelDateToJSDate, formatCurrency } from "@/lib/date";
import { toast } from "sonner";

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
  code: string;
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

interface ImportApiResponse {
  message: string;
  successCount: number;
  errorCount: number;
  results: Array<{
    index: number;
    data: SupplyData;
    success: boolean;
  }>;
  errors: ImportError[];
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

interface CsvDataRow {
  No: number;
  "Branch Name": string;
  Supplier: string;
  "BPB No": string;
  Tanggal: number;
  "SJ SUPPLIER No.": string;
  Faktur: string;
  "Faktur Date": string;
  "Code Product": string;
  Type: string;
  QTY: number;
  Warna: string;
  "Status.": string;
  "No. Mesin": string;
  "No. Rangka": string;
  "Harga/Unit": string;
  Discount: string;
  "AP. Unit": string;
  "Branch Code": string;
  Series: string;
  Kategori: string;
}

interface ImportError {
  index: number;
  error: string;
  data?: CsvDataRow;
}

export default function SupplyPage() {
  const [loading, setLoading] = useState(false);
  const [openImport, setOpenImport] = useState(false);
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
  const [importResult, setImportResult] = useState<{
    successCount: number;
    errorCount: number;
    errors: ImportError[];
    successfulIds?: number[];
    rollbackMessage?: string;
  } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    message: string;
  } | null>(null);

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

  const transformCsvDataToApiFormat = (csvData: CsvDataRow[]) => {
    return csvData.map((row, index) => {
      try {
        return {
          supplier: row.Supplier || "",
          sjSupplier: row["SJ SUPPLIER No."] || "",
          bpbNo: row["BPB No"] || "",
          color: row.Warna || "",
          status: row["Status."] || "",
          machineNumber: row["No. Mesin"] || "",
          frameNumber: row["No. Rangka"] || "",
          pricePerUnit: row["Harga/Unit"] || 0,
          discount: row.Discount || 0,
          apUnit: row["AP. Unit"] || 0,
          quantity: parseInt(row.QTY.toString()) || 0,
          faktur: row.Faktur || "",
          fakturDate: excelDateToJSDate(row["Faktur Date"]),
          date: excelDateToJSDate(row.Tanggal),
          branchCode: row["Branch Code"] || "",
          typeName: row.Type || "",
          category: row.Kategori || "",
          originalRowIndex: index,
        };
      } catch (error) {
        console.error(`Error transforming row ${index}:`, error);
        return {
          supplier: "",
          sjSupplier: "",
          bpbNo: "",
          color: "",
          status: "",
          machineNumber: "",
          frameNumber: "",
          pricePerUnit: 0,
          discount: 0,
          apUnit: 0,
          quantity: 0,
          faktur: "",
          fakturDate: "",
          date: "",
          branchCode: "",
          typeName: "",
          category: "",
          originalRowIndex: index,
        };
      }
    });
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
          const response = await fetch("/api/supply/batch-delete", {
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

            // Update import result to show rollback
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

            // Refresh data table
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

  // Helper to chunk array
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const handleImportConfirm = async (csvData: CsvDataRow[]) => {
    setImportLoading(true);
    setImportResult(null);
    setImportProgress(null);
    const BATCH_SIZE = 3000;

    // Initialize aggregated results
    let totalSuccess = 0;
    let totalError = 0;
    let allErrors: ImportError[] = [];
    let allSuccessfulIds: number[] = [];

    try {
      console.log({ csvData });
      const transformedData = transformCsvDataToApiFormat(csvData);
      const batches = chunkArray(transformedData, BATCH_SIZE);
      const totalBatches = batches.length;

      // Set initial progress
      setImportProgress({
        current: 0,
        total: totalBatches,
        message: "Mempersiapkan data untuk diimport..."
      });

      for (let i = 0; i < totalBatches; i++) {
        // Update progress
        setImportProgress({
          current: i + 1,
          total: totalBatches,
          message: `Memproses batch ke-${i + 1} dari ${totalBatches} (${batches[i].length} records)`
        });

        const batchData = batches[i];
        console.log(
          `Processing batch ${i + 1} of ${totalBatches} (${
            batchData.length
          } rows)`
        );

        try {
          const response = await fetch("/api/supply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(batchData),
          });

          const result = await response.json();

          if (response.ok || response.status === 207) {
            // Aggregate success counts
            totalSuccess += result.successCount || 0;
            totalError += result.errorCount || 0;

            // Collect successful IDs
            if (result.results) {
              const batchSuccessfulIds = result.results
                .filter((r: ImportApiResponse["results"][0]) => r.success)
                .map((r: ImportApiResponse["results"][0]) => r.data.id);
              allSuccessfulIds = [...allSuccessfulIds, ...batchSuccessfulIds];
            }

            // Collect errors
            if (result.errors) {
              allErrors = [...allErrors, ...result.errors];
            }
          } else {
            // Entire batch failed
            totalError += batchData.length;
            allErrors.push({
              index: 0,
              error: `Batch ${i + 1} failed: ${
                result.error || "Unknown error"
              }`,
            });
          }
        } catch (error) {
          console.error(`Error in batch ${i + 1}:`, error);
          totalError += batchData.length;
          allErrors.push({
            index: 0,
            error: `Batch ${i + 1} network error`,
          });
        }
      }

      // Set final results
      setImportResult({
        successCount: totalSuccess,
        errorCount: totalError,
        errors: allErrors,
        successfulIds: allSuccessfulIds,
      });

      if (totalSuccess > 0) {
        toast.success(
          `Berhasil mengimport ${totalSuccess} data dari ${csvData.length} total data`
        );
        // Refresh data table
        fetchData();
      }

      if (totalError > 0) {
        toast.warning(
          `${totalError} data gagal diimport. Silakan lihat detail error di bawah.`
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Terjadi kesalahan saat mengimport data");
      setImportResult({
        successCount: totalSuccess,
        errorCount: csvData.length - totalSuccess,
        errors: [...allErrors, { index: 0, error: "Process interrupted" }],
        successfulIds: allSuccessfulIds,
      });
    } finally {
      setImportLoading(false);
      setImportProgress(null);
      setOpenImport(false);
    }
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
                        {error.data && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            <Text code className="text-xs">
                              {JSON.stringify(error.data, null, 2)}
                            </Text>
                          </div>
                        )}
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
                title="Import Supply Data"
                loadingConfirm={importLoading}
                importProgress={importProgress}
                templateColumns={[
                  "No",
                  "Cabang",
                  "Supplier",
                  "BPB No",
                  "Tanggal",
                  "SJ SUPPLIER No.",
                  "Faktur",
                  "Faktur Date",
                  "Code Product",
                  "Type",
                  "QTY",
                  "Warna",
                  "Status.",
                  "No. Mesin",
                  "No. Rangka",
                  "Harga/Unit",
                  "Discount",
                  "AP. Unit",
                  "Kode Cabang",
                  "Series",
                ]}
              />
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
