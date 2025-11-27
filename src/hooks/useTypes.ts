import { useQuery } from "@tanstack/react-query";

interface Type {
  id: number;
  name: string;
  code: string;
}

interface ApiResponse {
  data: Type[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useTypes = (limit = 100) => {
  return useQuery({
    queryKey: ["types", limit],
    queryFn: async () => {
      const response = await fetch(`/api/types?limit=${limit}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch types");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
