/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  doPenjualan,
  branches,
  types,
  series as seriesTable,
} from "@/db/schema";
import { eq, and, gte, lte, sql, inArray, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchIds = searchParams.get("branchIds");
    const typeIds = searchParams.get("typeIds");
    const seriesId = searchParams.get("seriesId");
    const posValues = searchParams.get("pos");
    const productCategoryValues = searchParams.get("productCategory");
    const cashOrCreditValues = searchParams.get("cashOrCredit");
    const jabatanSalesForceValues = searchParams.get("jabatanSalesForce");

    // Build common where conditions
    const whereConditions: SQL<unknown>[] = [];

    if (startDate)
      whereConditions.push(gte(doPenjualan.soDate, new Date(startDate)));
    if (endDate)
      whereConditions.push(lte(doPenjualan.soDate, new Date(endDate)));
    if (branchIds)
      whereConditions.push(
        inArray(
          doPenjualan.branchId,
          branchIds.split(",").map((id) => parseInt(id))
        )
      );
    if (typeIds)
      whereConditions.push(
        inArray(
          doPenjualan.typeId,
          typeIds.split(",").map((id) => parseInt(id))
        )
      );
    if (seriesId) whereConditions.push(eq(types.seriesId, parseInt(seriesId)));
    if (posValues)
      whereConditions.push(inArray(doPenjualan.pos, posValues.split(",")));
    if (productCategoryValues)
      whereConditions.push(
        inArray(doPenjualan.productCategory, productCategoryValues.split(","))
      );
    if (cashOrCreditValues)
      whereConditions.push(
        inArray(doPenjualan.cashOrCredit, cashOrCreditValues.split("|"))
      );
    if (jabatanSalesForceValues)
      whereConditions.push(
        inArray(
          doPenjualan.jabatanSalesForce,
          jabatanSalesForceValues.split(",")
        )
      );

    // 1. Analytics (Area Chart) - Group by Month
    const analyticsQuery = db
      .select({
        month: sql<string>`TO_CHAR(${doPenjualan.soDate}, 'Mon')`,
        year: sql<string>`TO_CHAR(${doPenjualan.soDate}, 'YYYY')`,
        date: sql<string>`DATE_TRUNC('month', ${doPenjualan.soDate})`,
        quantity: sql<number>`COALESCE(SUM(${doPenjualan.quantity}), 0)`,
      })
      .from(doPenjualan)
      .leftJoin(types, eq(doPenjualan.typeId, types.id)) // Join types for seriesId filter
      .groupBy(
        sql`DATE_TRUNC('month', ${doPenjualan.soDate})`,
        sql`TO_CHAR(${doPenjualan.soDate}, 'Mon')`,
        sql`TO_CHAR(${doPenjualan.soDate}, 'YYYY')`
      )
      .orderBy(sql`DATE_TRUNC('month', ${doPenjualan.soDate})`);

    if (whereConditions.length > 0) {
      // We need to cast to any because whereConditions might use columns from joined tables
      (analyticsQuery as any).where(and(...whereConditions));
    }

    // 2. Bar Chart - Group by Branch
    const barChartQuery = db
      .select({
        branchId: branches.id,
        branchName: branches.name,
        branchCode: branches.code,
        quantity: sql<number>`COALESCE(SUM(${doPenjualan.quantity}), 0)`,
      })
      .from(doPenjualan)
      .leftJoin(branches, eq(doPenjualan.branchId, branches.id))
      .leftJoin(types, eq(doPenjualan.typeId, types.id))
      .groupBy(branches.id, branches.name, branches.code)
      .orderBy(sql`COALESCE(SUM(${doPenjualan.quantity}), 0) DESC`);

    if (whereConditions.length > 0) {
      (barChartQuery as any).where(and(...whereConditions));
    }

    // 3. Distributions
    // Helper to build distribution query
    const buildDistQuery = (
      selectCol: any,
      groupByCol: any,
      joinTypes = false,
      joinSeries = false
    ) => {
      let q = db
        .select({
          name: selectCol,
          quantity: sql<number>`COALESCE(SUM(${doPenjualan.quantity}), 0)`,
        })
        .from(doPenjualan);

      if (joinTypes || joinSeries) {
        q = q.leftJoin(types, eq(doPenjualan.typeId, types.id)) as any;
      }
      if (joinSeries) {
        q = q.leftJoin(seriesTable, eq(types.seriesId, seriesTable.id)) as any;
      }

      q = q
        .groupBy(groupByCol)
        .orderBy(sql`COALESCE(SUM(${doPenjualan.quantity}), 0) DESC`) as any;

      if (whereConditions.length > 0) {
        (q as any).where(and(...whereConditions));
      }
      return q;
    };

    // Execute all queries in parallel
    const [
      analyticsResults,
      barChartResults,
      salesSourceResults,
      typeResults,
      posResults,
      seriesResults,
      categoryResults,
      salesForceResults,
      kotaResults,
      kecamatanResults,
      tenorResults,
      cashOrCreditResults,
    ] = await Promise.all([
      analyticsQuery,
      barChartQuery,
      buildDistQuery(doPenjualan.salesSource, doPenjualan.salesSource, true),
      buildDistQuery(types.name, types.name, true),
      buildDistQuery(doPenjualan.pos, doPenjualan.pos, true),
      buildDistQuery(seriesTable.name, seriesTable.name, true, true),
      buildDistQuery(
        doPenjualan.productCategory,
        doPenjualan.productCategory,
        true
      ),
      buildDistQuery(doPenjualan.salesForce, doPenjualan.salesForce, true),
      buildDistQuery(doPenjualan.kota, doPenjualan.kota, true),
      buildDistQuery(doPenjualan.kecamatan, doPenjualan.kecamatan, true),
      buildDistQuery(doPenjualan.tenor, doPenjualan.tenor, true),
      buildDistQuery(doPenjualan.cashOrCredit, doPenjualan.cashOrCredit, true),
    ]);

    // Process Analytics Data
    const formattedAnalytics = analyticsResults.map((row) => ({
      month: `${row.month} ${row.year}`,
      quantity: Number(row.quantity),
      date: row.date,
    }));
    const totalAnalytics = formattedAnalytics.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Process Bar Chart Data
    const formattedBarChart = barChartResults
      .filter((row) => Number(row.quantity) > 0)
      .map((row) => ({
        branchId: row.branchId,
        branchName: row.branchName,
        branchCode: row.branchCode,
        quantity: Number(row.quantity),
      }));
    const totalBarChart = formattedBarChart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Helper to process distribution data
    const processDistribution = (results: any[]) => {
      const total = results.reduce((sum, row) => sum + Number(row.quantity), 0);
      const data = results
        .filter(
          (row) =>
            row.name !== null && row.name !== "" && Number(row.quantity) > 0
        )
        .map((row) => ({
          name: String(row.name),
          quantity: Number(row.quantity),
          percentage:
            total > 0
              ? parseFloat(((Number(row.quantity) / total) * 100).toFixed(2))
              : 0,
        }));
      return { data, total };
    };

    return NextResponse.json({
      analytics: {
        data: formattedAnalytics,
        total: totalAnalytics,
      },
      barChart: {
        data: formattedBarChart,
        total: totalBarChart,
      },
      distributions: {
        salesSource: processDistribution(salesSourceResults),
        type: processDistribution(typeResults),
        pos: processDistribution(posResults),
        series: processDistribution(seriesResults),
        productCategory: processDistribution(categoryResults),
        salesForce: processDistribution(salesForceResults),
        kota: processDistribution(kotaResults),
        kecamatan: processDistribution(kecamatanResults),
        tenor: processDistribution(tenorResults),
        cashOrCredit: processDistribution(cashOrCreditResults),
      },
    });
  } catch (error) {
    console.error("Dashboard Analytics API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data dashboard" },
      { status: 500 }
    );
  }
}
