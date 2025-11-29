import { useQuery } from "@tanstack/react-query";

interface MonthlyAnalyticsParams {
  startDate?: string;
  endDate?: string;
  branchIds?: number[];
  typeIds?: number[];
}

interface MonthlyAnalyticsResponse {
  data: { month: string; quantity: number }[];
  total: number;
}

export const useShoMonthly = (params: MonthlyAnalyticsParams) => {
  return useQuery({
    queryKey: ["sho-monthly", params],
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

      const response = await fetch(
        `/api/sho/monthly-analytics?${searchParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch SHO monthly analytics data");
      }

      const result: MonthlyAnalyticsResponse = await response.json();
      return result;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
