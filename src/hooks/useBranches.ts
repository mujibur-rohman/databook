import { useQuery } from "@tanstack/react-query";

interface Branch {
  id: number;
  name: string;
  code: string;
}

interface ApiResponse {
  data: Branch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useBranches = (limit = 100) => {
  return useQuery({
    queryKey: ["branches", limit],
    queryFn: async () => {
      const response = await fetch(`/api/branches?limit=${limit}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch branches");
      }

      const result: ApiResponse = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
