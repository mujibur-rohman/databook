import { useQuery } from "@tanstack/react-query";

interface MonthlyAnalyticsParams {
  startDate?: string;
  endDate?: string;
  branchIds?: number[];
  typeIds?: number[];
  pos?: string[];
  productCategory?: string[];
}

interface MonthlyAnalyticsResponse {
  data: { month: string; quantity: number }[];
  total: number;
}

export const useDoPenjualanMonthly = (params: MonthlyAnalyticsParams) => {
  return useQuery({
    queryKey: ["do-penjualan-monthly", params],
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
      if (params.pos && params.pos.length > 0) {
        searchParams.append("pos", params.pos.join(","));
      }
      if (params.productCategory && params.productCategory.length > 0) {
        searchParams.append(
          "productCategory",
          params.productCategory.join(",")
        );
      }

      const response = await fetch(
        `/api/do-penjualan/monthly-analytics?${searchParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch DO Penjualan monthly analytics data");
      }

      const result: MonthlyAnalyticsResponse = await response.json();
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
