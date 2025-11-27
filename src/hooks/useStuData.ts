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

export interface StuData {
  id: number;
  machineNumber: string | null;
  rangkaNumber: string | null;
  quantity: number | null;
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
  data: StuData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseStuDataParams {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  branchId?: string;
  typeId?: string;
}

export const useStuData = (params: UseStuDataParams) => {
  return useQuery({
    queryKey: ["stu", params],
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

      const response = await fetch(`/api/stu?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch STU data");
      }

      const result: ApiResponse = await response.json();
      return result;
    },
    staleTime: 30 * 1000,
  });
};
