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

export interface SupplyData {
  id: number;
  supplier: string | null;
  sjSupplier: string | null;
  bpb: string | null;
  color: string | null;
  status: string | null;
  machineNumber: string | null;
  rangkaNumber: string | null;
  price: number | null;
  discount: number | null;
  apUnit: number | null;
  quantity: number | null;
  faktur: string | null;
  fakturDate: string | null;
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
  data: SupplyData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseSupplyDataParams {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  branchId?: string;
  typeId?: string;
}

export const useSupplyData = (params: UseSupplyDataParams) => {
  return useQuery({
    queryKey: ["supply", params],
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

      const response = await fetch(`/api/supply?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Supply data");
      }

      const result: ApiResponse = await response.json();
      return result;
    },
    staleTime: 30 * 1000,
  });
};
