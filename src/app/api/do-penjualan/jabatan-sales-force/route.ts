import { NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan } from "@/db/schema";
import { sql } from "drizzle-orm";

// GET - Get all unique sales force positions with their counts
export async function GET() {
  try {
    const results = await db
      .select({
        name: doPenjualan.jabatanSalesForce,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(doPenjualan)
      .where(
        sql`${doPenjualan.jabatanSalesForce} IS NOT NULL AND ${doPenjualan.jabatanSalesForce} != ''`
      )
      .groupBy(doPenjualan.jabatanSalesForce)
      .orderBy(sql`COUNT(*) DESC`);

    return NextResponse.json({
      data: results,
    });
  } catch (error) {
    console.error("Jabatan Sales Force list error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data jabatan sales force" },
      { status: 500 }
    );
  }
}
