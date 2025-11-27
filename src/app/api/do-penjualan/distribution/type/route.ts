import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan, types as typesTable } from "@/db/schema";
import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";

// GET - Type distribution data with percentages
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

    const whereConditions = [];

    if (startDate)
      whereConditions.push(gte(doPenjualan.soDate, new Date(startDate)));
    if (endDate)
      whereConditions.push(lte(doPenjualan.soDate, new Date(endDate)));
    if (branchIds) {
      const branchIdArray = branchIds.split(",").map((id) => parseInt(id));
      whereConditions.push(inArray(doPenjualan.branchId, branchIdArray));
    }
    if (typeIds) {
      const typeIdArray = typeIds.split(",").map((id) => parseInt(id));
      whereConditions.push(inArray(doPenjualan.typeId, typeIdArray));
    }
    if (seriesId)
      whereConditions.push(eq(typesTable.seriesId, parseInt(seriesId)));
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

    let query = db
      .select({
        typeName: typesTable.name,
        quantity: sql<number>`COALESCE(SUM(${doPenjualan.quantity}), 0)`,
      })
      .from(doPenjualan)
      .leftJoin(typesTable, eq(doPenjualan.typeId, typesTable.id))
      .groupBy(typesTable.name)
      .orderBy(sql`COALESCE(SUM(${doPenjualan.quantity}), 0) DESC`);

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)) as typeof query;
    }

    const results = await query;
    const totalQuantity = results.reduce(
      (sum, row) => sum + Number(row.quantity),
      0
    );

    const formattedResults = results
      .filter((row) => row.typeName && Number(row.quantity) > 0)
      .map((row) => {
        const quantity = Number(row.quantity);
        const percentage =
          totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0;
        return {
          name: row.typeName,
          quantity: quantity,
          percentage: parseFloat(percentage.toFixed(2)),
        };
      });

    return NextResponse.json({ data: formattedResults, total: totalQuantity });
  } catch (error) {
    console.error("Type distribution error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data type" },
      { status: 500 }
    );
  }
}
