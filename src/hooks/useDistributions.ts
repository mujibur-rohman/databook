import { useQuery } from "@tanstack/react-query";

interface DistributionData {
  name: string;
  quantity: number;
  percentage: number;
}

interface ApiResponse {
  data: DistributionData[];
  total: number;
}

interface UseDistributionParams {
  startDate?: string;
  endDate?: string;
  branchIds?: number[];
  typeIds?: number[];
  seriesId?: string;
  pos?: string[];
  productCategory?: string[];
  cashOrCredit?: string[];
  jabatanSalesForce?: string[];
}

const createDistributionHook = (endpoint: string, queryKey: string) => {
  return (params: UseDistributionParams) => {
    return useQuery({
      queryKey: [queryKey, params],
      queryFn: async () => {
        const searchParams = new URLSearchParams();

        if (params.startDate)
          searchParams.append("startDate", params.startDate);
        if (params.endDate) searchParams.append("endDate", params.endDate);
        if (params.branchIds && params.branchIds.length > 0) {
          searchParams.append("branchIds", params.branchIds.join(","));
        }
        if (params.typeIds && params.typeIds.length > 0) {
          searchParams.append("typeIds", params.typeIds.join(","));
        }
        if (params.seriesId) searchParams.append("seriesId", params.seriesId);
        if (params.pos && params.pos.length > 0) {
          searchParams.append("pos", params.pos.join(","));
        }
        if (params.productCategory && params.productCategory.length > 0) {
          searchParams.append(
            "productCategory",
            params.productCategory.join(",")
          );
        }
        if (params.cashOrCredit && params.cashOrCredit.length > 0) {
          searchParams.append("cashOrCredit", params.cashOrCredit.join("|"));
        }
        if (params.jabatanSalesForce && params.jabatanSalesForce.length > 0) {
          searchParams.append(
            "jabatanSalesForce",
            params.jabatanSalesForce.join(",")
          );
        }

        const response = await fetch(`${endpoint}?${searchParams}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${queryKey} data`);
        }

        const result: ApiResponse = await response.json();
        return result;
      },
      staleTime: 60 * 1000, // 1 minute
    });
  };
};

export const useTypeDistribution = createDistributionHook(
  "/api/do-penjualan/distribution/type",
  "type-distribution"
);
export const usePosDistribution = createDistributionHook(
  "/api/do-penjualan/distribution/pos",
  "pos-distribution"
);
export const useSeriesDistribution = createDistributionHook(
  "/api/do-penjualan/distribution/series",
  "series-distribution"
);
export const useProductCategoryDistribution = createDistributionHook(
  "/api/do-penjualan/distribution/product-category",
  "product-category-distribution"
);
export const useSalesForceDistribution = createDistributionHook(
  "/api/do-penjualan/distribution/sales-force",
  "sales-force-distribution"
);
export const useKotaDistribution = createDistributionHook(
  "/api/do-penjualan/distribution/kota",
  "kota-distribution"
);
export const useKecamatanDistribution = createDistributionHook(
  "/api/do-penjualan/distribution/kecamatan",
  "kecamatan-distribution"
);
export const useTenorDistribution = createDistributionHook(
  "/api/do-penjualan/distribution/tenor",
  "tenor-distribution"
);
