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
  Spin,
  Modal,
} from "antd";
import { FileText, MagnifyingGlass, FunnelSimple } from "@phosphor-icons/react";
import AdminLayout from "@/components/layouts/AdminLayout";
import dayjs from "dayjs";
import ImportData from "@/components/ImportData";
import { toast } from "sonner";
import { usePosList } from "@/hooks/usePosList";
import { excelDateToJSDate } from "@/lib/date";

const { Title, Text } = Typography;
const { Search } = Input;

interface Branch {
  id: number;
  name: string;
  code: string;
}

interface CsvDataRow {
  No: number;
  "Branch Status": string;
  "Branch Code": string;
  "Branch Name": string;
  "SO Number": string;
  "SO Ref": string;
  Tanggal: number;
  "SO State": string;
  "Cash / Credit": string;
  TOP: string;
  "Customer Code": string;
  "Customer Name": string;
  KTP: string;
  Alamat: string;
  Kota: string;
  Kecamatan: string;
  "Tgl. Lahir": number;
  "No. HP": number;
  Pos: string;
  "Kode Type": string;
  "Product Description": string;
  "Product Colour": string;
  Qty: number;
  "Product Tahun": number;
  "No Mesin": string;
  "No Rangka": string;
  "Harga Off (+PPN)": string;
  "Diskon Reguler": string;
  "Diskon Program External": string;
  "Diskon Program Internal": string;
  "Total Diskon Program": string;
  "Total Diskon Invoice": string;
  "Harga Jual Bersih (+PPN)": string;
  DPP: string;
  PPN: string;
  "Titipan BBN": string;
  "Biaya Retur": string;
  "Total Piutang Penjualan": string;
  "Piutang Uang Muka": string;
  "Piutang Pelunasan": string;
  "Nama Channel": string;
  "Nama Mediator": string;
  "Jumlah Mediator": string;
  "Status PKP Customer": string;
  "Nomor Faktur Pajak": string;
  Kategori: string;
  Series: string;
  "Sales Coord Name": string;
  Salesforce: string;
  "Jabatan Salesforce": string;
  "Register Activity": string;
  "Main Dealer": string;
  "Insentif Finco": string;
  "PS AHM": string;
  "PS MD": string;
  "PS Finco": string;
  "PS External Total": string;
  "Diskon Beban Dealer + Mediator": string;
  HPP: string;
  "GP (DPP - HPP)": string;
  "GP + Klaim": string;
  "HPP BBN": string;
  "GP BBN": string;
  "Total GP": "496,136.00";
  "Selisih Diskon Program": string;
  "Beban Dealer Barang Bonus": string;
  "Sales Source": "Media Sosial";
  "Source Document": string;
  "JP PO": string;
  Tenor: string;
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

interface ImportApiResponse {
  message: string;
  successCount: number;
  errorCount: number;
  results: Array<{
    index: number;
    data: DoPenjualanData;
    success: boolean;
  }>;
  errors: ImportError[];
}

interface ImportError {
  index: number;
  error: string;
  data?: CsvDataRow;
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
  const [filterPos, setFilterPos] = useState<string[]>([]);
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

  // Fetch POS list
  const { data: posList = [] } = usePosList();

  // Fetch data
  const fetchData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    search = searchText,
    sort = sortBy,
    order = sortOrder,
    branchId = filterBranchId,
    typeId = filterTypeId,
    cashOrCredit = filterCashOrCredit,
    pos = filterPos
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
      if (pos && pos.length > 0) params.append("pos", pos.join(","));

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
      filterCashOrCredit,
      filterPos
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
      filterCashOrCredit,
      filterPos
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
      filterCashOrCredit,
      filterPos
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
      filterCashOrCredit,
      filterPos
    );
  };

  const handleCashOrCreditFilter = (value: string) => {
    setFilterCashOrCredit(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(
      1,
      pagination.pageSize,
      searchText,
      sortBy,
      sortOrder,
      filterBranchId,
      filterTypeId,
      value,
      filterPos
    );
  };

  const handlePosFilter = (value: string[]) => {
    setFilterPos(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(
      1,
      pagination.pageSize,
      searchText,
      sortBy,
      sortOrder,
      filterBranchId,
      filterTypeId,
      filterCashOrCredit,
      value
    );
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterBranchId("");
    setFilterTypeId("");
    setFilterCashOrCredit("");
    setFilterPos([]);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, "", sortBy, sortOrder, "", "", "", []);
  };

  const transformCsvDataToApiFormat = (csvData: CsvDataRow[]) => {
    return csvData.map((row, index) => {
      try {
        return {
          soNumber: row["SO Number"] || "",
          soDate: excelDateToJSDate(row["Tanggal"]),
          soState: row["SO State"] || "",
          cashOrCredit: row["Cash / Credit"] || "",
          top: row.TOP || "",
          customerCode: row["Customer Code"] || "",
          customerName: row["Customer Name"] || "",
          ktp: row.KTP || "",
          alamat: row.Alamat || "",
          kota: row.Kota || "",
          kecamatan: row.Kecamatan || "",
          birthday: excelDateToJSDate(row["Tgl. Lahir"]),
          phoneNumber: row["No. HP"]?.toString() || "",
          pos: row.Pos || "",
          color: row["Product Colour"] || "",
          quantity: parseInt(row.Qty?.toString()) || 0,
          year: row["Product Tahun"]?.toString() || "",
          engineNumber: row["No Mesin"] || "",
          chassisNumber: row["No Rangka"] || "",
          productCategory: row.Kategori || "",
          salesPic: row["Sales Coord Name"] || "",
          salesForce: row.Salesforce || "",
          jabatanSalesForce: row["Jabatan Salesforce"] || "",
          mainDealer: row["Main Dealer"] || "",
          salesSource: row["Sales Source"] || "",
          sourceDocument: row["Source Document"] || "",
          jpPo: parseInt(row["JP PO"]?.toString()) || null,
          tenor: parseInt(row.Tenor?.toString()) || null,
          branchCode: row["Branch Code"] || "",
          typeName: row["Kode Type"] || "",
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
          const response = await fetch("/api/do-penjualan/batch-delete", {
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

  const handleImportConfirm = async (csvData: CsvDataRow[]) => {
    setImportLoading(true);
    setImportResult(null);
    try {
      console.log({ csvData });
      const transformedData = transformCsvDataToApiFormat(csvData);

      const response = await fetch("/api/do-penjualan", {
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
        const color =
          record.cashOrCredit === "Cash"
            ? "green"
            : record.cashOrCredit === "Credit"
            ? "blue"
            : "default";
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
            <Text code className="text-xs block">
              E: {record.engineNumber?.slice(-8) || "-"}
            </Text>
          </Tooltip>
          <Tooltip title={record.chassisNumber}>
            <Text code className="text-xs">
              C: {record.chassisNumber?.slice(-8) || "-"}
            </Text>
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

              <Select
                mode="multiple"
                placeholder="Filter POS"
                value={filterPos}
                onChange={handlePosFilter}
                style={{ minWidth: 200 }}
                maxTagCount="responsive"
                maxTagPlaceholder={(omittedValues) =>
                  omittedValues.length === posList.length
                    ? "Semua POS"
                    : `${omittedValues[0].label} +${omittedValues.length - 1}`
                }
                showSearch
                optionFilterProp="children"
              >
                {posList.map((pos) => (
                  <Select.Option key={pos.name} value={pos.name}>
                    {pos.name} ({pos.count})
                  </Select.Option>
                ))}
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
                  title="Import DO Penjualan Data"
                  loadingConfirm={importLoading}
                  templateColumns={[
                    "No",
                    "Branch Status",
                    "Branch Code",
                    "Branch Name",
                    "SO Number",
                    "SO Ref",
                    "SO Date",
                    "SO State",
                    "Cash / Credit",
                    "TOP",
                    "Customer Code",
                    "Customer Name",
                    "KTP",
                    "Alamat",
                    "Kota",
                    "Kecamatan",
                    "Tgl. Lahir",
                    "No. HP",
                    "Pos",
                    "Product Type",
                    "Product Description",
                    "Product Colour",
                    "Qty",
                    "Product Tahun",
                    "Engine Number",
                    "Chassis Number",
                    "Harga Off (+PPN)",
                    "Diskon Reguler",
                    "Diskon Program External",
                    "Diskon Program Internal",
                    "Total Diskon Program",
                    "Total Diskon Invoice",
                    "Harga Jual Bersih (+PPN)",
                    "DPP",
                    "PPN",
                    "Titipan BBN",
                    "Biaya Retur",
                    "Total Piutang Penjualan",
                    "Piutang Uang Muka",
                    "Piutang Pelunasan",
                    "Nama Channel",
                    "Nama Mediator",
                    "Jumlah Mediator",
                    "Status PKP Customer",
                    "Nomor Faktur Pajak",
                    "Kategori Produk-1",
                    "Series",
                    "Sales Coord Name",
                    "Salesforce",
                    "Jabatan Salesforce",
                    "Register Activity",
                    "Main Dealer",
                    "Insentif Finco",
                    "PS AHM",
                    "PS MD",
                    "PS Finco",
                    "PS External Total",
                    "Diskon Beban Dealer + Mediator",
                    "HPP",
                    "GP (DPP - HPP)",
                    "GP + Klaim",
                    "HPP BBN",
                    "GP BBN",
                    "Total GP",
                    "Selisih Diskon Program",
                    "Beban Dealer Barang Bonus",
                    "Sales Source",
                    "Source Document",
                    "JP PO",
                    "Tenor",
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
            scroll={{ x: 1600 }}
            size="small"
          />
        </Card>
      </div>
    </AdminLayout>
  );
}
