import { NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan } from "@/db/schema";
import { sql } from "drizzle-orm";

// GET - Get all unique cash/credit types with their counts
export async function GET() {
  try {
    const results = await db
      .select({
        name: doPenjualan.cashOrCredit,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(doPenjualan)
      .where(
        sql`${doPenjualan.cashOrCredit} IS NOT NULL AND ${doPenjualan.cashOrCredit} != ''`
      )
      .groupBy(doPenjualan.cashOrCredit)
      .orderBy(sql`COUNT(*) DESC`);

    return NextResponse.json({
      data: results,
    });
  } catch (error) {
    console.error("Cash/Credit list error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data tipe pembayaran" },
      { status: 500 }
    );
  }
}
