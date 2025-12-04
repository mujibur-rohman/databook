/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import {
  Modal,
  Button,
  Upload,
  Table,
  Typography,
  Space,
  Alert,
  Divider,
  Spin,
  Card,
  message,
  Select,
  Progress,
} from "antd";
import {
  CloudArrowUp,
  FileArrowUp,
  Eye,
  CheckCircle,
} from "@phosphor-icons/react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface ImportDataProps {
  title?: string;
  visible: boolean;
  onCancel: () => void;
  onConfirmImport?: (data: any[]) => void;
  acceptedFormats?: string[];
  templateColumns?: string[];
  maxFileSize?: number; // in MB
  worksheetName?: string;
  loadingConfirm?: boolean;
  useMonthFilter?: boolean;
  filterMode?: "month" | "day"; // "month" for monthly filter, "day" for daily filter
  dateColumnName?: string; // Column name for date filtering (default: "Tanggal")
  importProgress?: {
    current: number;
    total: number;
    message: string;
  } | null;
}

interface ParsedData {
  worksheetName: string;
  headers: string[];
  rows: any[];
  totalRecords: number;
}

export default function ImportData({
  title = "Import Data",
  visible,
  onCancel,
  onConfirmImport,
  acceptedFormats = [".xlsx", ".xls", ".csv"],
  templateColumns = [],
  maxFileSize = 10,
  loadingConfirm = false,
  dateColumnName = "Tanggal",
  filterMode = "month",
  importProgress = null,
}: ImportDataProps) {
  const [loading, setLoading] = useState(false);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [worksheet, setWorksheet] = useState<string | null>(null);
  const [previewStep, setPreviewStep] = useState<"upload" | "preview">(
    "upload"
  );
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<
    { label: string; value: string }[]
  >([]);
  const [availableDays, setAvailableDays] = useState<
    { label: string; value: string; isYesterday?: boolean }[]
  >([]);

  const parsedData: ParsedData | null = useMemo(() => {
    // // Determine worksheet to use
    if (workbook && worksheet) {
      const targetWorksheet = workbook.Sheets[worksheet]; // Default to first sheet
      const usedSheetName = worksheet;

      if (!targetWorksheet) {
        throw new Error(`Worksheet "${usedSheetName}" tidak ditemukan`);
      }

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(targetWorksheet, {
        header: 1, // Return as array of arrays
        defval: "", // Default value for empty cells
      }) as any[][];

      if (jsonData.length === 0) {
        throw new Error("File kosong atau tidak ada data");
      }

      // Extract headers (first row) and data rows
      const headers = jsonData[0] as string[];
      const rows = jsonData
        .slice(1)
        .filter((row) =>
          row.some((cell) => cell !== null && cell !== undefined && cell !== "")
        );

      console.log("Workbook", workbook);

      // Create parsed data object
      const parsed: ParsedData = {
        worksheetName: usedSheetName,
        headers: headers,
        rows: rows,
        totalRecords: rows.length,
      };

      // Extract available months from date column
      const dateColumnIndex = headers.findIndex((h) => h === dateColumnName);
      if (dateColumnIndex !== -1) {
        const monthsSet = new Set<string>();
        rows.forEach((row) => {
          const dateValue = row[dateColumnIndex];
          if (dateValue) {
            // Handle Excel date numbers
            let date;
            if (typeof dateValue === "number") {
              // Excel date to JS date
              const excelEpoch = new Date(1899, 11, 30);
              const excelEpochAsUnixTimestamp = excelEpoch.getTime();
              const missingLeapYearDay = 24 * 60 * 60 * 1000;
              const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
              const excelTimestampAsUnixTimestamp =
                delta + dateValue * 24 * 60 * 60 * 1000;
              date = dayjs(new Date(excelTimestampAsUnixTimestamp));
            } else {
              date = dayjs(dateValue);
            }

            if (date.isValid()) {
              const monthValue = date.format("YYYY-MM");
              monthsSet.add(monthValue);
            }
          }
        });

        // Convert to array and sort
        const months = Array.from(monthsSet)
          .sort((a, b) => b.localeCompare(a))
          .map((monthValue) => {
            const date = dayjs(monthValue);
            const monthNames = [
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ];
            const monthName = monthNames[date.month()];
            const year = date.year();
            return {
              label: `${monthName} ${year}`,
              value: monthValue,
            };
          });

        setAvailableMonths(months);
      }

      // Extract available days (last 7 days) from date column for daily mode
      if (filterMode === "day" && dateColumnIndex !== -1) {
        const daysSet = new Set<string>();
        const today = dayjs();
        const sevenDaysAgo = today.subtract(7, "day");

        rows.forEach((row) => {
          const dateValue = row[dateColumnIndex];
          if (dateValue) {
            let date;
            if (typeof dateValue === "number") {
              const excelEpoch = new Date(1899, 11, 30);
              const excelEpochAsUnixTimestamp = excelEpoch.getTime();
              const missingLeapYearDay = 24 * 60 * 60 * 1000;
              const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
              const excelTimestampAsUnixTimestamp =
                delta + dateValue * 24 * 60 * 60 * 1000;
              date = dayjs(new Date(excelTimestampAsUnixTimestamp));
            } else {
              date = dayjs(dateValue);
            }

            if (
              date.isValid() &&
              date.isAfter(sevenDaysAgo) &&
              date.isBefore(today.add(1, "day"))
            ) {
              const dayValue = date.format("YYYY-MM-DD");
              daysSet.add(dayValue);
            }
          }
        });

        // Convert to array and sort (newest first)
        const yesterday = today.subtract(1, "day");
        const days = Array.from(daysSet)
          .sort((a, b) => b.localeCompare(a))
          .map((dayValue) => {
            const date = dayjs(dayValue);
            const isYesterday = date.isSame(yesterday, "day");
            const dayNames = [
              "Minggu",
              "Senin",
              "Selasa",
              "Rabu",
              "Kamis",
              "Jumat",
              "Sabtu",
            ];
            const dayName = dayNames[date.day()];
            const formattedDate = date.format("DD/MM/YYYY");

            return {
              label: isYesterday
                ? `Kemarin (${formattedDate})`
                : `${dayName}, ${formattedDate}`,
              value: dayValue,
              isYesterday,
            };
          });

        setAvailableDays(days);
      }

      return parsed;
    }

    return null;
  }, [workbook, worksheet, dateColumnName, filterMode]);

  const resetState = () => {
    setWorkbook(null);
    setPreviewStep("upload");
    setLoading(false);
    setSelectedMonth(null);
    setSelectedDay(null);
    setAvailableMonths([]);
    setAvailableDays([]);
  };

  const handleCancel = () => {
    resetState();
    onCancel();
  };

  const handleFileUpload = (file: File) => {
    setLoading(true);

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      message.error(`File terlalu besar. Maksimal ${maxFileSize}MB`);
      setLoading(false);
      return false;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      console.log("END");
      setLoading(false);
      setPreviewStep("preview");
    };
    reader.onprogress = async () => {
      setLoading(true);
    };
    reader.onload = (e) => {
      setLoading(true);
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        setWorkbook(workbook);
      } catch (error) {
        console.error("Error parsing file:", error);
        message.error(
          `Gagal memproses file: ${
            error instanceof Error ? error.message : "Format file tidak valid"
          }`
        );
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
    return false; // Prevent upload to server
  };

  const handleConfirmImport = () => {
    if (parsedData && onConfirmImport) {
      let rowsToImport = parsedData.rows;

      // Filter by selected month if applicable
      if (filterMode === "month" && selectedMonth && dateColumnName) {
        const dateColumnIndex = parsedData.headers.findIndex(
          (h) => h === dateColumnName
        );

        if (dateColumnIndex !== -1) {
          rowsToImport = parsedData.rows.filter((row) => {
            const dateValue = row[dateColumnIndex];
            if (!dateValue) return false;

            // Handle Excel date numbers
            let date;
            if (typeof dateValue === "number") {
              const excelEpoch = new Date(1899, 11, 30);
              const excelEpochAsUnixTimestamp = excelEpoch.getTime();
              const missingLeapYearDay = 24 * 60 * 60 * 1000;
              const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
              const excelTimestampAsUnixTimestamp =
                delta + dateValue * 24 * 60 * 60 * 1000;
              date = dayjs(new Date(excelTimestampAsUnixTimestamp));
            } else {
              date = dayjs(dateValue);
            }

            if (!date.isValid()) return false;

            return date.format("YYYY-MM") === selectedMonth;
          });
        }
      }

      // Convert array of arrays back to objects
      const dataObjects = rowsToImport.map((row) => {
        const obj: any = {};
        parsedData.headers.forEach((header, index) => {
          obj[header] = row[index] || "";
        });
        return obj;
      });

      onConfirmImport(dataObjects);
      // handleCancel();
    }
  };

  // Create table columns for preview
  const previewColumns =
    parsedData?.headers.map((header, index) => ({
      title: header,
      dataIndex: index,
      key: index,
      width: 150,
      ellipsis: true,
      render: (text: any) => (
        <Text style={{ fontSize: "12px" }}>
          {text === null || text === undefined ? "" : String(text)}
        </Text>
      ),
    })) || [];

  // Prepare data source for table (first 10 rows for preview)
  const previewDataSource =
    parsedData?.rows.slice(0, 10).map((row, index) => ({
      key: index,
      ...row,
    })) || [];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileArrowUp size={20} />
          {title}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={previewStep === "preview" ? 1000 : 600}
      footer={
        previewStep === "upload" ? null : (
          <Space>
            <Button
              onClick={() => setPreviewStep("upload")}
              disabled={loadingConfirm}
            >
              Pilih File Lain
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmImport}
              icon={<CheckCircle size={16} />}
              loading={loadingConfirm}
              disabled={loadingConfirm}
            >
              {loadingConfirm ? "Mengimport..." : "Konfirmasi Import"} (
              {filterMode === "month" && selectedMonth
                ? parsedData?.rows.filter((row) => {
                    const dateColumnIndex = parsedData.headers.findIndex(
                      (h) => h === dateColumnName
                    );
                    if (dateColumnIndex === -1) return true;
                    const dateValue = row[dateColumnIndex];
                    if (!dateValue) return false;
                    let date;
                    if (typeof dateValue === "number") {
                      const excelEpoch = new Date(1899, 11, 30);
                      const excelEpochAsUnixTimestamp = excelEpoch.getTime();
                      const missingLeapYearDay = 24 * 60 * 60 * 1000;
                      const delta =
                        excelEpochAsUnixTimestamp - missingLeapYearDay;
                      const excelTimestampAsUnixTimestamp =
                        delta + dateValue * 24 * 60 * 60 * 1000;
                      date = dayjs(new Date(excelTimestampAsUnixTimestamp));
                    } else {
                      date = dayjs(dateValue);
                    }
                    return (
                      date.isValid() && date.format("YYYY-MM") === selectedMonth
                    );
                  }).length
                : filterMode === "day" && selectedDay
                ? parsedData?.rows.filter((row) => {
                    const dateColumnIndex = parsedData.headers.findIndex(
                      (h) => h === dateColumnName
                    );
                    if (dateColumnIndex === -1) return true;
                    const dateValue = row[dateColumnIndex];
                    if (!dateValue) return false;
                    let date;
                    if (typeof dateValue === "number") {
                      const excelEpoch = new Date(1899, 11, 30);
                      const excelEpochAsUnixTimestamp = excelEpoch.getTime();
                      const missingLeapYearDay = 24 * 60 * 60 * 1000;
                      const delta =
                        excelEpochAsUnixTimestamp - missingLeapYearDay;
                      const excelTimestampAsUnixTimestamp =
                        delta + dateValue * 24 * 60 * 60 * 1000;
                      date = dayjs(new Date(excelTimestampAsUnixTimestamp));
                    } else {
                      date = dayjs(dateValue);
                    }
                    return (
                      date.isValid() &&
                      date.format("YYYY-MM-DD") === selectedDay
                    );
                  }).length
                : parsedData?.totalRecords}{" "}
              records)
            </Button>
          </Space>
        )
      }
      maskClosable={!loadingConfirm}
      closable={!loadingConfirm}
    >
      {/* Import Progress Overlay */}
      {importProgress && loadingConfirm && (
        <div className="absolute inset-0 bg-white bg-opacity-95 z-50 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 p-8">
            <div className="text-2xl">📤</div>
            <div className="space-y-3">
              <Text strong className="text-lg block">
                Mengimport Data...
              </Text>
              <Progress
                percent={Math.round(
                  (importProgress.current / importProgress.total) * 100
                )}
                status="active"
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                size="default"
                className="w-80"
              />
              <div className="space-y-1">
                <Text type="secondary" className="text-sm block">
                  {importProgress.message}
                </Text>
                <Text type="secondary" className="text-xs block">
                  Batch {importProgress.current} dari {importProgress.total}
                </Text>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <Text className="text-sm">
                Mohon tunggu, jangan tutup halaman ini...
              </Text>
            </div>
          </div>
        </div>
      )}

      <Spin spinning={loading}>
        {previewStep === "upload" ? (
          // Upload Step
          <div className="space-y-4">
            {templateColumns.length > 0 && (
              <Alert
                message="Format Template"
                description={
                  <div>
                    <Text>Pastikan file Excel/CSV memiliki kolom berikut:</Text>
                    <div className="mt-2">
                      {templateColumns.map((col, index) => (
                        <Text key={index} code className="mr-2">
                          {col}
                        </Text>
                      ))}
                    </div>
                    {worksheet && (
                      <div className="mt-2">
                        <Text strong>Worksheet: </Text>
                        <Text code>{worksheet}</Text>
                      </div>
                    )}
                  </div>
                }
                type="info"
                showIcon
              />
            )}

            <Dragger
              beforeUpload={handleFileUpload}
              accept={acceptedFormats.join(",")}
              showUploadList={false}
              multiple={false}
            >
              <div className="py-8 mt-4">
                <div className="flex justify-center mb-4">
                  <CloudArrowUp size={48} className="text-blue-500" />
                </div>
                <Title level={4} className="text-center mb-2">
                  Pilih atau Drop File Di Sini
                </Title>
                <Text type="secondary" className="text-center block">
                  Mendukung format: {acceptedFormats.join(", ")}
                </Text>
                <Text type="secondary" className="text-center block">
                  Maksimal ukuran file: {maxFileSize}MB
                </Text>
              </div>
            </Dragger>
          </div>
        ) : (
          // Preview Step
          <>
            <div className="space-y-1">
              <p>Pilih Worksheet</p>
              <Select
                options={workbook?.SheetNames.map((name) => ({
                  label: name,
                  value: name,
                }))}
                onChange={(val) => {
                  console.log({ val });
                  setWorksheet(val);
                }}
                placeholder="Pilih Worksheet"
                className="w-full"
              />
            </div>
            <div className="space-y-4 pt-4">
              {parsedData ? (
                <>
                  <Card size="small">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <Text type="secondary">Worksheet</Text>
                        <div className="font-medium">
                          {parsedData?.worksheetName}
                        </div>
                      </div>
                      <div>
                        <Text type="secondary">Total Records</Text>
                        <div className="font-medium text-blue-600">
                          {parsedData?.totalRecords}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {filterMode === "month" && availableMonths.length > 0 ? (
                    <Card size="small" className="bg-blue-50">
                      <div className="space-y-2">
                        <Text strong>Filter Bulan:</Text>
                        <Select
                          placeholder="Pilih bulan atau kosongkan untuk import semua"
                          value={selectedMonth}
                          onChange={setSelectedMonth}
                          style={{ width: "100%" }}
                          allowClear
                        >
                          {availableMonths.map((month) => (
                            <Select.Option
                              key={month.value}
                              value={month.value}
                            >
                              {month.label}
                            </Select.Option>
                          ))}
                        </Select>
                        {selectedMonth && (
                          <Text type="secondary" className="text-xs block">
                            📊 Data yang akan diimport:{" "}
                            <strong>
                              {
                                parsedData.rows.filter((row) => {
                                  const dateColumnIndex =
                                    parsedData.headers.findIndex(
                                      (h) => h === dateColumnName
                                    );
                                  if (dateColumnIndex === -1) return true;
                                  const dateValue = row[dateColumnIndex];
                                  if (!dateValue) return false;
                                  let date;
                                  if (typeof dateValue === "number") {
                                    const excelEpoch = new Date(1899, 11, 30);
                                    const excelEpochAsUnixTimestamp =
                                      excelEpoch.getTime();
                                    const missingLeapYearDay =
                                      24 * 60 * 60 * 1000;
                                    const delta =
                                      excelEpochAsUnixTimestamp -
                                      missingLeapYearDay;
                                    const excelTimestampAsUnixTimestamp =
                                      delta + dateValue * 24 * 60 * 60 * 1000;
                                    date = dayjs(
                                      new Date(excelTimestampAsUnixTimestamp)
                                    );
                                  } else {
                                    date = dayjs(dateValue);
                                  }
                                  return (
                                    date.isValid() &&
                                    date.format("YYYY-MM") === selectedMonth
                                  );
                                }).length
                              }
                            </strong>{" "}
                            dari {parsedData.totalRecords} total records
                          </Text>
                        )}
                      </div>
                    </Card>
                  ) : null}

                  {filterMode === "day" && availableDays.length > 0 ? (
                    <Card size="small" className="bg-green-50">
                      <div className="space-y-2">
                        <Text strong>Filter Hari (7 Hari Terakhir):</Text>
                        <Select
                          placeholder="Pilih hari atau kosongkan untuk import semua"
                          value={selectedDay}
                          onChange={setSelectedDay}
                          style={{ width: "100%" }}
                          allowClear
                        >
                          {availableDays.map((day) => (
                            <Select.Option key={day.value} value={day.value}>
                              {day.label}
                            </Select.Option>
                          ))}
                        </Select>
                        {selectedDay && (
                          <Text type="secondary" className="text-xs block">
                            📊 Data yang akan diimport:{" "}
                            <strong>
                              {
                                parsedData.rows.filter((row) => {
                                  const dateColumnIndex =
                                    parsedData.headers.findIndex(
                                      (h) => h === dateColumnName
                                    );
                                  if (dateColumnIndex === -1) return true;
                                  const dateValue = row[dateColumnIndex];
                                  if (!dateValue) return false;
                                  let date;
                                  if (typeof dateValue === "number") {
                                    const excelEpoch = new Date(1899, 11, 30);
                                    const excelEpochAsUnixTimestamp =
                                      excelEpoch.getTime();
                                    const missingLeapYearDay =
                                      24 * 60 * 60 * 1000;
                                    const delta =
                                      excelEpochAsUnixTimestamp -
                                      missingLeapYearDay;
                                    const excelTimestampAsUnixTimestamp =
                                      delta + dateValue * 24 * 60 * 60 * 1000;
                                    date = dayjs(
                                      new Date(excelTimestampAsUnixTimestamp)
                                    );
                                  } else {
                                    date = dayjs(dateValue);
                                  }
                                  return (
                                    date.isValid() &&
                                    date.format("YYYY-MM-DD") === selectedDay
                                  );
                                }).length
                              }
                            </strong>{" "}
                            dari {parsedData.totalRecords} total records
                          </Text>
                        )}
                      </div>
                    </Card>
                  ) : null}

                  <div>
                    <Title level={5} className="flex items-center gap-2">
                      <Eye size={16} />
                      Kolom yang Terdeteksi ({parsedData?.headers.length})
                    </Title>
                    <div className="flex flex-wrap gap-2">
                      {parsedData?.headers.map((header, index) => (
                        <Text
                          key={index}
                          code
                          className="px-2 py-1 bg-blue-50 rounded"
                        >
                          {header}
                        </Text>
                      ))}
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <Title level={5}>Preview Data (10 baris pertama)</Title>
                    <Table
                      columns={previewColumns}
                      dataSource={previewDataSource}
                      pagination={false}
                      scroll={{ x: 800 }}
                      size="small"
                      bordered
                    />
                    {parsedData && parsedData.totalRecords > 10 && (
                      <Text type="secondary" className="mt-2 block">
                        ... dan {parsedData.totalRecords - 10} baris lainnya
                      </Text>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </>
        )}
      </Spin>
    </Modal>
  );
}
