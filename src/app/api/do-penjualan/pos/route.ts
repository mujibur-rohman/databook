import { NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan } from "@/db/schema";
import { sql } from "drizzle-orm";

// GET - Get all unique POS values with their counts
export async function GET() {
  try {
    const results = await db
      .select({
        name: doPenjualan.pos,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(doPenjualan)
      .where(sql`${doPenjualan.pos} IS NOT NULL AND ${doPenjualan.pos} != ''`)
      .groupBy(doPenjualan.pos)
      .orderBy(sql`COUNT(*) DESC`);

    return NextResponse.json({
      data: results,
    });
  } catch (error) {
    console.error("POS list error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data POS" },
      { status: 500 }
    );
  }
}
