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
} from "antd";
import {
  CloudArrowUp,
  FileArrowUp,
  Eye,
  CheckCircle,
} from "@phosphor-icons/react";
import * as XLSX from "xlsx";

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
}: ImportDataProps) {
  const [loading, setLoading] = useState(false);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [worksheet, setWorksheet] = useState<string | null>(null);
  const [previewStep, setPreviewStep] = useState<"upload" | "preview">(
    "upload"
  );

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

      return parsed;
    }

    return null;
  }, [workbook, worksheet]);

  const resetState = () => {
    setWorkbook(null);
    setPreviewStep("upload");
    setLoading(false);
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
      // Convert array of arrays back to objects
      const dataObjects = parsedData.rows.map((row) => {
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
            <Button onClick={() => setPreviewStep("upload")}>
              Pilih File Lain
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmImport}
              icon={<CheckCircle size={16} />}
            >
              Konfirmasi Import ({parsedData?.totalRecords} records)
            </Button>
          </Space>
        )
      }
      maskClosable={false}
    >
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
              <div className="py-8">
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
