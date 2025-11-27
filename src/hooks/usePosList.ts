import { useQuery } from "@tanstack/react-query";

interface PosData {
  name: string;
  count: number;
}

interface ApiResponse {
  data: PosData[];
}

export const usePosList = () => {
  return useQuery({
    queryKey: ["pos-list"],
    queryFn: async () => {
      const response = await fetch("/api/do-penjualan/pos", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch POS list");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
