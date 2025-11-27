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

export interface ShoData {
  id: number;
  category: string | null;
  color: string | null;
  location: string | null;
  quantity: number | null;
  dateGrn: string | null;
  rangkaNumber: string | null;
  year: string | null;
  positionStock: string | null;
  status: string | null;
  count: number | null;
  umurStock: number | null;
  umurMutasi: number | null;
  sourceDoc: string | null;
  sourceBranch: string | null;
  date: string | null;
  branchId: number;
  typeId: number;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
  type: Type;
  series: Series;
}

interface ApiResponse {
  data: ShoData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseShoDataParams {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  branchId?: string;
  typeId?: string;
  status?: string;
}

export const useShoData = (params: UseShoDataParams) => {
  return useQuery({
    queryKey: ["sho", params],
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

      const response = await fetch(`/api/sho?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch SHO data");
      }

      const result: ApiResponse = await response.json();
      return result;
    },
    staleTime: 30 * 1000,
  });
};
