import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stu, types } from "@/db/schema";
import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";

// GET - Monthly analytics data for STU
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchIds = searchParams.get("branchIds");
    const typeIds = searchParams.get("typeIds");

    // Build where conditions
    const whereConditions = [];

    if (startDate) {
      whereConditions.push(gte(stu.date, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(stu.date, new Date(endDate)));
    }

    if (branchIds) {
      const branchIdArray = branchIds.split(",").map((id) => parseInt(id));
      whereConditions.push(inArray(stu.branchId, branchIdArray));
    }

    if (typeIds) {
      const typeIdArray = typeIds.split(",").map((id) => parseInt(id));
      whereConditions.push(inArray(stu.typeId, typeIdArray));
    }

    // Query with monthly aggregation
    let query = db
      .select({
        month: sql<string>`TO_CHAR(${stu.date}, 'YYYY-MM')`,
        quantity: sql<number>`COALESCE(SUM(${stu.quantity}), 0)`,
      })
      .from(stu)
      .leftJoin(types, eq(stu.typeId, types.id))
      .groupBy(sql`TO_CHAR(${stu.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${stu.date}, 'YYYY-MM')`);

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
    console.error("STU Monthly Analytics error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data analytics" },
      { status: 500 }
    );
  }
}
