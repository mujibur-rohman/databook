"use client";

import { useState, useEffect } from "react";
import { Card, Typography, Select, DatePicker, Spin } from "antd";
import AdminLayout from "@/components/layouts/AdminLayout";
import dynamic from "next/dynamic";
import { useDoPenjualanAnalytics } from "@/hooks/useDoPenjualanAnalytics";
import { useDoPenjualanBarChart } from "@/hooks/useDoPenjualanBarChart";
import { useBranches } from "@/hooks/useBranches";
import { useTypes } from "@/hooks/useTypes";
import { usePosList } from "@/hooks/usePosList";
import {
  useProductCategoryList,
  useCashOrCreditList,
  useJabatanSalesForceList,
} from "@/hooks/useCategoryLists";
import dayjs, { Dayjs } from "dayjs";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("year"),
    dayjs(),
  ]);
  const [filterBranchIds, setFilterBranchIds] = useState<number[]>([]);
  const [filterTypeIds, setFilterTypeIds] = useState<number[]>([]);
  const [filterPos, setFilterPos] = useState<string[]>([]);
  const [filterProductCategory, setFilterProductCategory] = useState<string[]>(
    []
  );
  const [filterCashOrCredit, setFilterCashOrCredit] = useState<string[]>([]);
  const [filterJabatanSalesForce, setFilterJabatanSalesForce] = useState<
    string[]
  >([]);

  // Fetch all filter lists
  const { data: branches = [] } = useBranches();
  const { data: types = [] } = useTypes();
  const { data: posList = [] } = usePosList();
  const { data: productCategoryList = [] } = useProductCategoryList();
  const { data: cashOrCreditList = [] } = useCashOrCreditList();
  const { data: jabatanSalesForceList = [] } = useJabatanSalesForceList();

  // Initialize filters with all IDs when data loads
  useEffect(() => {
    if (branches.length > 0 && filterBranchIds.length === 0) {
      setFilterBranchIds(branches.map((b) => b.id));
    }
  }, [branches, filterBranchIds.length]);

  useEffect(() => {
    if (types.length > 0 && filterTypeIds.length === 0) {
      setFilterTypeIds(types.map((t) => t.id));
    }
  }, [types, filterTypeIds.length]);

  useEffect(() => {
    if (posList.length > 0 && filterPos.length === 0) {
      setFilterPos(posList.map((p) => p.name));
    }
  }, [posList, filterPos.length]);

  useEffect(() => {
    if (productCategoryList.length > 0 && filterProductCategory.length === 0) {
      setFilterProductCategory(productCategoryList.map((c) => c.name));
    }
  }, [productCategoryList, filterProductCategory.length]);

  useEffect(() => {
    if (cashOrCreditList.length > 0 && filterCashOrCredit.length === 0) {
      setFilterCashOrCredit(cashOrCreditList.map((c) => c.name));
    }
  }, [cashOrCreditList, filterCashOrCredit.length]);

  useEffect(() => {
    if (
      jabatanSalesForceList.length > 0 &&
      filterJabatanSalesForce.length === 0
    ) {
      setFilterJabatanSalesForce(jabatanSalesForceList.map((j) => j.name));
    }
  }, [jabatanSalesForceList, filterJabatanSalesForce.length]);

  // Fetch analytics data
  const { data: analyticsResponse, isLoading } = useDoPenjualanAnalytics({
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    branchIds: filterBranchIds,
    typeIds: filterTypeIds,
    pos: filterPos,
    productCategory: filterProductCategory,
    cashOrCredit: filterCashOrCredit,
    jabatanSalesForce: filterJabatanSalesForce,
  });

  const analyticsData = analyticsResponse?.data || [];
  const total = analyticsResponse?.total || 0;

  // Fetch bar chart data
  const { data: barChartResponse } = useDoPenjualanBarChart({
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    branchIds: filterBranchIds,
    typeIds: filterTypeIds,
    pos: filterPos,
    productCategory: filterProductCategory,
    cashOrCredit: filterCashOrCredit,
    jabatanSalesForce: filterJabatanSalesForce,
  });

  const barChartData = barChartResponse?.data || [];

  // Prepare chart data
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    title: {
      text: "DO Penjualan - Quantity per Bulan",
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: 600,
      },
    },
    subtitle: {
      text: `Total: ${total.toLocaleString("id-ID")} unit`,
      align: "left",
    },
    xaxis: {
      categories: analyticsData.map((item) => item.month),
      labels: {
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: {
      title: {
        text: "Quantity",
      },
      labels: {
        formatter: (value) => Math.floor(value).toString(),
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    colors: ["#1890ff"],
    tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString("id-ID")} unit`,
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  const series = [
    {
      name: "Quantity",
      data: analyticsData.map((item) => item.quantity),
    },
  ];

  // Prepare bar chart data
  const barChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 400,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toString(),
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: barChartData.map(
        (item) => `${item.branchName} (${item.branchCode})`
      ),
      labels: {
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: {
      title: {
        text: "Quantity",
      },
      labels: {
        formatter: (value) => Math.floor(value).toString(),
      },
    },
    title: {
      text: "DO Penjualan per Cabang",
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: 600,
      },
    },
    subtitle: {
      text: `Total: ${
        barChartResponse?.total.toLocaleString("id-ID") || 0
      } unit`,
      align: "left",
    },
    colors: ["#00E396"],
    tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString("id-ID")} unit`,
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  const barChartSeries = [
    {
      name: "Quantity",
      data: barChartData.map((item) => item.quantity),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Title level={2} className="mb-2">
            Dashboard Penjualan
          </Title>
          <Text type="secondary">
            Analisis data penjualan kendaraan bermotor
          </Text>
        </div>

        {/* Filters */}
        <Card>
          <div className="mb-4">
            <Text strong className="block mb-3 text-base">
              Filter Data
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <Text className="block mb-2" type="secondary">
                  Periode Tanggal
                </Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) =>
                    setDateRange(dates as [Dayjs | null, Dayjs | null])
                  }
                  format="DD/MM/YYYY"
                  placeholder={["Tanggal Mulai", "Tanggal Akhir"]}
                  style={{ width: "100%" }}
                />
              </div>

              {/* Branch */}
              <div>
                <Text className="block mb-2" type="secondary">
                  Cabang
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Pilih Cabang"
                  value={filterBranchIds}
                  onChange={setFilterBranchIds}
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  maxTagPlaceholder={(omittedValues) =>
                    omittedValues.length === branches.length
                      ? "Semua Cabang"
                      : `${omittedValues[0].label} +${omittedValues.length - 1}`
                  }
                  showSearch
                  optionFilterProp="children"
                >
                  {branches.map((branch) => (
                    <Select.Option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Type */}
              <div>
                <Text className="block mb-2" type="secondary">
                  Tipe
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Pilih Type"
                  value={filterTypeIds}
                  onChange={setFilterTypeIds}
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  maxTagPlaceholder={(omittedValues) =>
                    omittedValues.length === types.length
                      ? "Semua Type"
                      : `${omittedValues[0].label} +${omittedValues.length - 1}`
                  }
                  showSearch
                  optionFilterProp="children"
                >
                  {types.map((type) => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Product Category */}
              <div>
                <Text className="block mb-2" type="secondary">
                  Kategori Produk
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Filter Kategori Produk"
                  value={filterProductCategory}
                  onChange={setFilterProductCategory}
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  maxTagPlaceholder={(omittedValues) =>
                    omittedValues.length === productCategoryList.length
                      ? "Semua Kategori"
                      : `${omittedValues[0].label} +${omittedValues.length - 1}`
                  }
                  showSearch
                  optionFilterProp="children"
                >
                  {productCategoryList.map((cat) => (
                    <Select.Option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.count})
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Cash or Credit */}
              <div>
                <Text className="block mb-2" type="secondary">
                  Tipe Pembayaran
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Cash or Credit"
                  value={filterCashOrCredit}
                  onChange={setFilterCashOrCredit}
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  maxTagPlaceholder={(omittedValues) =>
                    omittedValues.length === cashOrCreditList.length
                      ? "Semua Tipe"
                      : `${omittedValues[0]?.label} +${
                          omittedValues.length - 1
                        }`
                  }
                  showSearch
                  optionFilterProp="children"
                >
                  {cashOrCreditList.map((type) => (
                    <Select.Option key={type.name} value={type.name}>
                      {type.name} ({type.count})
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* POS */}
              <div>
                <Text className="block mb-2" type="secondary">
                  Point of Sale (POS)
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Filter POS"
                  value={filterPos}
                  onChange={setFilterPos}
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  maxTagPlaceholder={(omittedValues) =>
                    omittedValues.length === posList.length
                      ? "Semua POS"
                      : `${omittedValues[0]?.label} +${
                          omittedValues.length - 1
                        }`
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
              </div>

              {/* Jabatan Sales Force */}
              <div>
                <Text className="block mb-2" type="secondary">
                  Jabatan Sales
                </Text>
                <Select
                  mode="multiple"
                  placeholder="Filter Jabatan Sales"
                  value={filterJabatanSalesForce}
                  onChange={setFilterJabatanSalesForce}
                  style={{ width: "100%" }}
                  maxTagCount="responsive"
                  maxTagPlaceholder={(omittedValues) =>
                    omittedValues.length === jabatanSalesForceList.length
                      ? "Semua Jabatan"
                      : `${omittedValues[0]?.label} +${
                          omittedValues.length - 1
                        }`
                  }
                  showSearch
                  optionFilterProp="children"
                >
                  {jabatanSalesForceList.map((jabatan) => (
                    <Select.Option key={jabatan.name} value={jabatan.name}>
                      {jabatan.name} ({jabatan.count})
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        {analyticsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-center">
                <Text type="secondary" className="block mb-2">
                  Total Quantity
                </Text>
                <div className="text-3xl font-bold text-blue-600">
                  {total.toLocaleString("id-ID")}
                </div>
                <Text type="secondary" className="text-sm">
                  unit
                </Text>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <Text type="secondary" className="block mb-2">
                  Rata-rata per Bulan
                </Text>
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(total / analyticsData.length).toLocaleString(
                    "id-ID"
                  )}
                </div>
                <Text type="secondary" className="text-sm">
                  unit/bulan
                </Text>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <Text type="secondary" className="block mb-2">
                  Bulan Tertinggi
                </Text>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.max(
                    ...analyticsData.map((item) => item.quantity)
                  ).toLocaleString("id-ID")}
                </div>
                <Text type="secondary" className="text-sm">
                  {
                    analyticsData.find(
                      (item) =>
                        item.quantity ===
                        Math.max(...analyticsData.map((i) => i.quantity))
                    )?.month
                  }
                </Text>
              </div>
            </Card>
          </div>
        )}

        {/* Chart */}
        <Card>
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Spin size="large" />
            </div>
          ) : analyticsData.length > 0 ? (
            <Chart
              options={chartOptions}
              series={series}
              type="area"
              height={400}
            />
          ) : (
            <div className="flex justify-center items-center h-96">
              <Text type="secondary">
                Tidak ada data untuk ditampilkan. Silakan sesuaikan filter.
              </Text>
            </div>
          )}
        </Card>

        {/* Bar Chart - DO Penjualan per Cabang */}
        <Card>
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Spin size="large" />
            </div>
          ) : barChartData.length > 0 ? (
            <Chart
              options={barChartOptions}
              series={barChartSeries}
              type="bar"
              height={400}
            />
          ) : (
            <div className="flex justify-center items-center h-96">
              <Text type="secondary">
                Tidak ada data untuk ditampilkan. Silakan sesuaikan filter.
              </Text>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
