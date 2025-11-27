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

export interface DoPenjualanData {
  id: number;
  soNumber: string | null;
  soDate: string | null;
  soState: string | null;
  cashOrCredit: string | null;
  top: string | null;
  customerCode: string | null;
  customerName: string | null;
  ktp: string | null;
  alamat: string | null;
  kota: string | null;
  kecamatan: string | null;
  birthday: string | null;
  phoneNumber: string | null;
  pos: string | null;
  color: string | null;
  quantity: number | null;
  year: string | null;
  engineNumber: string | null;
  chassisNumber: string | null;
  productCategory: string | null;
  salesPic: string | null;
  salesForce: string | null;
  jabatanSalesForce: string | null;
  mainDealer: string | null;
  salesSource: string | null;
  sourceDocument: string | null;
  jpPo: number | null;
  tenor: number | null;
  branchId: number;
  typeId: number;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
  type: Type;
  series: Series;
}

interface ApiResponse {
  data: DoPenjualanData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseDoPenjualanDataParams {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  branchId?: string;
  typeId?: string;
  cashOrCredit?: string;
  pos?: string[];
}

export const useDoPenjualanData = (params: UseDoPenjualanDataParams) => {
  return useQuery({
    queryKey: ["do-penjualan", params],
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
      if (params.cashOrCredit)
        searchParams.append("cashOrCredit", params.cashOrCredit);
      if (params.pos && params.pos.length > 0) {
        searchParams.append("pos", params.pos.join(","));
      }

      const response = await fetch(`/api/do-penjualan?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch DO Penjualan data");
      }

      const result: ApiResponse = await response.json();
      return result;
    },
    staleTime: 30 * 1000,
  });
};
