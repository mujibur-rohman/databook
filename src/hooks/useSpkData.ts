import { useQuery } from "@tanstack/react-query";

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

export interface SpkData {
  id: number;
  spkNumber: string | null;
  date: string | null;
  customerName: string | null;
  stnkName: string | null;
  bbn: string | null;
  salesName: string | null;
  salesTeam: string | null;
  fincoName: string | null;
  salesSource: string | null;
  registerNumber: string | null;
  color: string | null;
  quantity: number | null;
  dpTotal: string | null;
  discount: string | null;
  credit: string | null;
  tenor: string | null;
  status: string | null;
  cancelReason: string | null;
  branchId: number;
  typeId: number;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
  type: Type;
  series: Series;
}

interface ApiResponse {
  data: SpkData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseSpkDataParams {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  branchId?: string;
  typeId?: string;
  status?: string;
}

export const useSpkData = (params: UseSpkDataParams) => {
  return useQuery({
    queryKey: ["spk", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      });

      if (params.branchId) searchParams.append("branchId", params.branchId);
      if (params.typeId) searchParams.append("typeId", params.typeId);
      if (params.status) searchParams.append("status", params.status);

      const response = await fetch(`/api/spk?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch SPK data");
      }

      const result: ApiResponse = await response.json();
      return result;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};
