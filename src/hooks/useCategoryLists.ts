import { useQuery } from "@tanstack/react-query";

interface CategoryData {
  name: string;
  count: number;
}

interface ApiResponse {
  data: CategoryData[];
}

export const useProductCategoryList = () => {
  return useQuery({
    queryKey: ["product-category-list"],
    queryFn: async () => {
      const response = await fetch("/api/do-penjualan/product-category", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch product category list");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCashOrCreditList = () => {
  return useQuery({
    queryKey: ["cash-or-credit-list"],
    queryFn: async () => {
      const response = await fetch("/api/do-penjualan/cash-or-credit", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cash/credit list");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJabatanSalesForceList = () => {
  return useQuery({
    queryKey: ["jabatan-sales-force-list"],
    queryFn: async () => {
      const response = await fetch("/api/do-penjualan/jabatan-sales-force", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch jabatan sales force list");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
