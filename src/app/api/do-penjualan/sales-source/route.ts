import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan, types } from "@/db/schema";
import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";

// GET - Sales source data with percentages
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

    // Query with sales source aggregation
    let query = db
      .select({
        salesSource: doPenjualan.salesSource,
        quantity: sql<number>`COALESCE(SUM(${doPenjualan.quantity}), 0)`,
      })
      .from(doPenjualan)
      .leftJoin(types, eq(doPenjualan.typeId, types.id))
      .groupBy(doPenjualan.salesSource)
      .orderBy(sql`COALESCE(SUM(${doPenjualan.quantity}), 0) DESC`);

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)) as typeof query;
    }

    const results = await query;

    // Calculate total quantity
    const totalQuantity = results.reduce(
      (sum, row) => sum + Number(row.quantity),
      0
    );

    // Filter out null/empty sales sources and calculate percentages
    const formattedResults = results
      .filter((row) => row.salesSource && Number(row.quantity) > 0)
      .map((row) => {
        const quantity = Number(row.quantity);
        const percentage =
          totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0;

        return {
          salesSource: row.salesSource,
          quantity: quantity,
          percentage: parseFloat(percentage.toFixed(2)),
        };
      });

    return NextResponse.json({
      data: formattedResults,
      total: totalQuantity,
    });
  } catch (error) {
    console.error("Sales Source error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data sales source" },
      { status: 500 }
    );
  }
}
