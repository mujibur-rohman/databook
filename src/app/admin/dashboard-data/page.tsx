"use client";

import { useState, useEffect } from "react";
import { Card, Typography, Select, DatePicker, Spin } from "antd";
import AdminLayout from "@/components/layouts/AdminLayout";
import dynamic from "next/dynamic";
import { useBranches } from "@/hooks/useBranches";
import { useTypes } from "@/hooks/useTypes";
import { usePosList } from "@/hooks/usePosList";
import { useProductCategoryList } from "@/hooks/useCategoryLists";
import { useDoPenjualanMonthly } from "@/hooks/useDoPenjualanMonthly";
import { useSupplyMonthly } from "@/hooks/useSupplyMonthly";
import { useShoMonthly } from "@/hooks/useShoMonthly";
import { useStuMonthly } from "@/hooks/useStuMonthly";
import { useSellInMonthly } from "@/hooks/useSellInMonthly";
import { useSpkMonthly } from "@/hooks/useSpkMonthly";
import dayjs, { Dayjs } from "dayjs";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function DashboardDataPage() {
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

  // Fetch all filter lists
  const { data: branches = [] } = useBranches();
  const { data: types = [] } = useTypes();
  const { data: posList = [] } = usePosList();
  const { data: productCategoryList = [] } = useProductCategoryList();

  // Initialize filters with all IDs when data loads
  useEffect(() => {
    if (branches.length > 0 && filterBranchIds.length === 0) {
      setFilterBranchIds(branches.map((b) => b.id));
    }
    if (types.length > 0 && filterTypeIds.length === 0) {
      setFilterTypeIds(types.map((t) => t.id));
    }
    if (posList.length > 0 && filterPos.length === 0) {
      setFilterPos(posList.map((p) => p.name));
    }
    if (productCategoryList.length > 0 && filterProductCategory.length === 0) {
      setFilterProductCategory(productCategoryList.map((c) => c.name));
    }
  }, [
    branches,
    filterBranchIds.length,
    types,
    filterTypeIds.length,
    posList,
    filterPos.length,
    productCategoryList,
    filterProductCategory.length,
  ]);

  // Common filter params
  const commonParams = {
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    branchIds: filterBranchIds,
    typeIds: filterTypeIds,
  };

  // Fetch data for all 6 charts
  const { data: doPenjualanData, isLoading: isLoadingDoPenjualan } =
    useDoPenjualanMonthly({
      ...commonParams,
      pos: filterPos,
      productCategory: filterProductCategory,
    });

  const { data: supplyData, isLoading: isLoadingSupply } =
    useSupplyMonthly(commonParams);

  const { data: shoData, isLoading: isLoadingSho } =
    useShoMonthly(commonParams);

  const { data: stuData, isLoading: isLoadingStu } =
    useStuMonthly(commonParams);

  const { data: sellInData, isLoading: isLoadingSellIn } =
    useSellInMonthly(commonParams);

  const { data: spkData, isLoading: isLoadingSpk } =
    useSpkMonthly(commonParams);

  // Helper function to create bar chart options
  const createBarChartOptions = (
    title: string,
    data: { month: string; quantity: number }[] = [],
    total: number = 0,
    color: string = "#1890ff"
  ): ApexCharts.ApexOptions => ({
    chart: {
      type: "bar",
      height: 350,
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
      categories: data.map((item) => item.month),
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
      text: title,
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
    colors: [color],
    tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString("id-ID")} unit`,
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  });

  // Chart configurations
  const charts = [
    {
      title: "DO Penjualan per Bulan",
      data: doPenjualanData?.data || [],
      total: doPenjualanData?.total || 0,
      isLoading: isLoadingDoPenjualan,
      color: "#1890ff",
    },
    {
      title: "Supply per Bulan",
      data: supplyData?.data || [],
      total: supplyData?.total || 0,
      isLoading: isLoadingSupply,
      color: "#52c41a",
    },
    {
      title: "SHO per Bulan",
      data: shoData?.data || [],
      total: shoData?.total || 0,
      isLoading: isLoadingSho,
      color: "#faad14",
    },
    {
      title: "STU per Bulan",
      data: stuData?.data || [],
      total: stuData?.total || 0,
      isLoading: isLoadingStu,
      color: "#722ed1",
    },
    {
      title: "Sell-In per Bulan",
      data: sellInData?.data || [],
      total: sellInData?.total || 0,
      isLoading: isLoadingSellIn,
      color: "#eb2f96",
    },
    {
      title: "SPK per Bulan",
      data: spkData?.data || [],
      total: spkData?.total || 0,
      isLoading: isLoadingSpk,
      color: "#13c2c2",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Title level={2} className="mb-2">
            Dashboard Data
          </Title>
          <Text type="secondary">
            Analisis data bulanan untuk semua kategori (DO Penjualan, Supply,
            SHO, STU, Sell-In, SPK)
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
                  Kategori Produk (DO Penjualan)
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

              {/* POS */}
              <div>
                <Text className="block mb-2" type="secondary">
                  POS (DO Penjualan)
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
            </div>
          </div>
        </Card>

        {/* Bar Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map((chart, index) => (
            <Card key={index}>
              {chart.isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Spin size="large" />
                </div>
              ) : chart.data.length > 0 ? (
                <Chart
                  options={createBarChartOptions(
                    chart.title,
                    chart.data,
                    chart.total,
                    chart.color
                  )}
                  series={[
                    {
                      name: "Quantity",
                      data: chart.data.map((item) => item.quantity),
                    },
                  ]}
                  type="bar"
                  height={350}
                />
              ) : (
                <div className="flex justify-center items-center h-96">
                  <Text type="secondary">
                    Tidak ada data untuk ditampilkan. Silakan sesuaikan filter.
                  </Text>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
