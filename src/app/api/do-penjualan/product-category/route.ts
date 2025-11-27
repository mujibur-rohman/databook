import { NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan } from "@/db/schema";
import { sql } from "drizzle-orm";

// GET - Get all unique product categories with their counts
export async function GET() {
  try {
    const results = await db
      .select({
        name: doPenjualan.productCategory,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(doPenjualan)
      .where(
        sql`${doPenjualan.productCategory} IS NOT NULL AND ${doPenjualan.productCategory} != ''`
      )
      .groupBy(doPenjualan.productCategory)
      .orderBy(sql`COUNT(*) DESC`);

    return NextResponse.json({
      data: results,
    });
  } catch (error) {
    console.error("Product Category list error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data kategori produk" },
      { status: 500 }
    );
  }
}
