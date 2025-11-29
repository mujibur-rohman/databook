import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan, types } from "@/db/schema";
import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";

// GET - Monthly analytics data for DO Penjualan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchIds = searchParams.get("branchIds");
    const typeIds = searchParams.get("typeIds");
    const posValues = searchParams.get("pos");
    const productCategoryValues = searchParams.get("productCategory");

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

    if (posValues) {
      const posArray = posValues.split(",");
      whereConditions.push(inArray(doPenjualan.pos, posArray));
    }

    if (productCategoryValues) {
      const categoryArray = productCategoryValues.split(",");
      whereConditions.push(inArray(doPenjualan.productCategory, categoryArray));
    }

    // Query with monthly aggregation
    let query = db
      .select({
        month: sql<string>`TO_CHAR(${doPenjualan.soDate}, 'YYYY-MM')`,
        quantity: sql<number>`COALESCE(SUM(${doPenjualan.quantity}), 0)`,
      })
      .from(doPenjualan)
      .leftJoin(types, eq(doPenjualan.typeId, types.id))
      .groupBy(sql`TO_CHAR(${doPenjualan.soDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${doPenjualan.soDate}, 'YYYY-MM')`);

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)) as typeof query;
    }

    const results = await query;

    // Format the results
    const formattedResults = results.map((row) => {
      const [year, month] = row.month.split("-");
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const monthName = monthNames[parseInt(month) - 1];

      return {
        month: `${monthName} ${year}`,
        quantity: Number(row.quantity),
      };
    });

    return NextResponse.json({
      data: formattedResults,
      total: formattedResults.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("DO Penjualan Monthly Analytics error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data analytics" },
      { status: 500 }
    );
  }
}
