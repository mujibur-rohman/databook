import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan, branches, types } from "@/db/schema";
import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";

// GET - Bar chart data for DO Penjualan grouped by branch
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

    // Build where conditions
    const whereConditions = [];

    if (startDate) {
      whereConditions.push(gte(doPenjualan.soDate, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(doPenjualan.soDate, new Date(endDate)));
    }

    if (branchIds) {
      const branchIdArray = branchIds.split(",").map((id) => parseInt(id));
      whereConditions.push(inArray(doPenjualan.branchId, branchIdArray));
    }

    if (typeIds) {
      const typeIdArray = typeIds.split(",").map((id) => parseInt(id));
      whereConditions.push(inArray(doPenjualan.typeId, typeIdArray));
    }

    if (seriesId) {
      whereConditions.push(eq(types.seriesId, parseInt(seriesId)));
    }

    if (posValues) {
      const posArray = posValues.split(",");
      whereConditions.push(inArray(doPenjualan.pos, posArray));
    }

    if (productCategoryValues) {
      const categoryArray = productCategoryValues.split(",");
      whereConditions.push(inArray(doPenjualan.productCategory, categoryArray));
    }

    if (cashOrCreditValues) {
      const cashCreditArray = cashOrCreditValues.split("|");
      whereConditions.push(inArray(doPenjualan.cashOrCredit, cashCreditArray));
    }

    if (jabatanSalesForceValues) {
      const jabatanArray = jabatanSalesForceValues.split(",");
      whereConditions.push(
        inArray(doPenjualan.jabatanSalesForce, jabatanArray)
      );
    }

    // Query with branch aggregation
    let query = db
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
      query = query.where(and(...whereConditions)) as typeof query;
    }

    const results = await query;

    // Filter out branches with zero quantity
    const filteredResults = results
      .filter((row) => Number(row.quantity) > 0)
      .map((row) => ({
        branchId: row.branchId,
        branchName: row.branchName,
        branchCode: row.branchCode,
        quantity: Number(row.quantity),
      }));

    return NextResponse.json({
      data: filteredResults,
      total: filteredResults.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("DO Penjualan Bar Chart error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data bar chart" },
      { status: 500 }
    );
  }
}
