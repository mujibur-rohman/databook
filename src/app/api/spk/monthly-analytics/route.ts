import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spk, types } from "@/db/schema";
import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";

// GET - Monthly analytics data for SPK
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
      whereConditions.push(gte(spk.date, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(spk.date, new Date(endDate)));
    }

    if (branchIds) {
      const branchIdArray = branchIds.split(",").map((id) => parseInt(id));
      whereConditions.push(inArray(spk.branchId, branchIdArray));
    }

    if (typeIds) {
      const typeIdArray = typeIds.split(",").map((id) => parseInt(id));
      whereConditions.push(inArray(spk.typeId, typeIdArray));
    }

    // Query with monthly aggregation
    let query = db
      .select({
        month: sql<string>`TO_CHAR(${spk.date}, 'YYYY-MM')`,
        quantity: sql<number>`COALESCE(SUM(${spk.quantity}), 0)`,
      })
      .from(spk)
      .leftJoin(types, eq(spk.typeId, types.id))
      .groupBy(sql`TO_CHAR(${spk.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${spk.date}, 'YYYY-MM')`);

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
    console.error("SPK Monthly Analytics error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data analytics" },
      { status: 500 }
    );
  }
}
