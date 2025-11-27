import { useQuery } from "@tanstack/react-query";

interface BarChartData {
  branchId: number;
  branchName: string;
  branchCode: string;
  quantity: number;
}

interface ApiResponse {
  data: BarChartData[];
  total: number;
}

interface UseDoPenjualanBarChartParams {
  startDate?: string;
  endDate?: string;
  branchIds?: number[];
  typeIds?: number[];
  seriesId?: string;
  pos?: string[];
  productCategory?: string[];
  cashOrCredit?: string[];
  jabatanSalesForce?: string[];
}

export const useDoPenjualanBarChart = (
  params: UseDoPenjualanBarChartParams
) => {
  return useQuery({
    queryKey: ["do-penjualan-bar-chart", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.startDate) searchParams.append("startDate", params.startDate);
      if (params.endDate) searchParams.append("endDate", params.endDate);
      if (params.branchIds && params.branchIds.length > 0) {
        searchParams.append("branchIds", params.branchIds.join(","));
      }
      if (params.typeIds && params.typeIds.length > 0) {
        searchParams.append("typeIds", params.typeIds.join(","));
      }
      if (params.seriesId) searchParams.append("seriesId", params.seriesId);
      if (params.pos && params.pos.length > 0) {
        searchParams.append("pos", params.pos.join(","));
      }
      if (params.productCategory && params.productCategory.length > 0) {
        searchParams.append(
          "productCategory",
          params.productCategory.join(",")
        );
      }
      if (params.cashOrCredit && params.cashOrCredit.length > 0) {
        searchParams.append("cashOrCredit", params.cashOrCredit.join("|"));
      }
      if (params.jabatanSalesForce && params.jabatanSalesForce.length > 0) {
        searchParams.append(
          "jabatanSalesForce",
          params.jabatanSalesForce.join(",")
        );
      }

      const response = await fetch(
        `/api/do-penjualan/bar-chart?${searchParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch DO Penjualan bar chart data");
      }

      const result: ApiResponse = await response.json();
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
