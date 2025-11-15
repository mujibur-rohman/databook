import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sellIn, branches, types, series } from "@/db/schema";
import { eq, ilike, desc, asc, count, or, and } from "drizzle-orm";

// Interface untuk request body
interface SellInItem {
  quantity: number;
  sellDate: string;
  description: string;
  branchCode: string;
  typeName: string;
}

// GET - List sell_in with pagination, search, and relations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const branchId = searchParams.get("branchId");
    const typeId = searchParams.get("typeId");

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(sellIn.description, `%${search}%`),
          ilike(branches.name, `%${search}%`),
          ilike(types.name, `%${search}%`),
          ilike(branches.code, `%${search}%`)
        )
      );
    }

    if (branchId) {
      whereConditions.push(eq(sellIn.branchId, parseInt(branchId)));
    }

    if (typeId) {
      whereConditions.push(eq(sellIn.typeId, parseInt(typeId)));
    }

    // Get total count
    const totalQuery = db
      .select({ count: count() })
      .from(sellIn)
      .leftJoin(branches, eq(sellIn.branchId, branches.id))
      .leftJoin(types, eq(sellIn.typeId, types.id))
      .leftJoin(series, eq(types.seriesId, series.id));

    if (whereConditions.length > 0) {
      totalQuery.where(
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)
      );
    }

    const totalResult = await totalQuery;
    const total = totalResult[0].count;

    // Build order condition
    let orderCondition;
    if (sortBy === "quantity") {
      orderCondition =
        sortOrder === "asc" ? asc(sellIn.quantity) : desc(sellIn.quantity);
    } else if (sortBy === "sellDate") {
      orderCondition =
        sortOrder === "asc" ? asc(sellIn.sellDate) : desc(sellIn.sellDate);
    } else if (sortBy === "description") {
      orderCondition =
        sortOrder === "asc"
          ? asc(sellIn.description)
          : desc(sellIn.description);
    } else {
      orderCondition =
        sortOrder === "asc" ? asc(sellIn.createdAt) : desc(sellIn.createdAt);
    }

    // Get paginated data with relations
    const dataQuery = db
      .select({
        id: sellIn.id,
        quantity: sellIn.quantity,
        sellDate: sellIn.sellDate,
        description: sellIn.description,
        branchId: sellIn.branchId,
        typeId: sellIn.typeId,
        createdAt: sellIn.createdAt,
        updatedAt: sellIn.updatedAt,
        branch: {
          id: branches.id,
          name: branches.name,
          code: branches.code,
        },
        type: {
          id: types.id,
          name: types.name,
          code: types.code,
        },
        series: {
          id: series.id,
          name: series.name,
        },
      })
      .from(sellIn)
      .leftJoin(branches, eq(sellIn.branchId, branches.id))
      .leftJoin(types, eq(sellIn.typeId, types.id))
      .leftJoin(series, eq(types.seriesId, series.id))
      .orderBy(orderCondition)
      .limit(limit)
      .offset(offset);

    if (whereConditions.length > 0) {
      dataQuery.where(
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)
      );
    }

    const data = await dataQuery;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("SellIn GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data sell in" },
      { status: 500 }
    );
  }
}

// POST - Create multiple sell_in records
export async function POST(request: NextRequest) {
  try {
    const body: SellInItem[] = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Data harus berupa array dan tidak boleh kosong" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < body.length; i++) {
      const item = body[i];

      try {
        // Validate required fields
        if (
          !item.quantity ||
          !item.sellDate ||
          !item.description ||
          !item.branchCode ||
          !item.typeName
        ) {
          errors.push({
            index: i,
            error:
              "Semua field wajib diisi: quantity, sellDate, description, branchCode, typeName",
          });
          continue;
        }

        // Find branch by code
        const branch = await db
          .select()
          .from(branches)
          .where(eq(branches.code, item.branchCode))
          .limit(1);

        if (branch.length === 0) {
          errors.push({
            index: i,
            error: `Branch dengan kode ${item.branchCode} tidak ditemukan`,
          });
          continue;
        }

        // Find type by name
        const type = await db
          .select()
          .from(types)
          .where(ilike(types.name, item.typeName))
          .limit(1);

        if (type.length === 0) {
          errors.push({
            index: i,
            error: `Type dengan nama ${item.typeName} tidak ditemukan`,
          });
          continue;
        }

        // Insert sell_in record
        const newSellIn = await db
          .insert(sellIn)
          .values({
            quantity: item.quantity,
            sellDate: new Date(item.sellDate),
            description: item.description,
            branchId: branch[0].id,
            typeId: type[0].id,
          })
          .returning();

        results.push({
          index: i,
          data: newSellIn[0],
          success: true,
        });
      } catch (itemError) {
        console.error(`Error processing item ${i}:`, itemError);
        errors.push({
          index: i,
          error: "Terjadi kesalahan saat memproses data",
        });
      }
    }

    const response = {
      message: `Berhasil memproses ${results.length} dari ${body.length} data`,
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors,
    };

    const statusCode = errors.length > 0 ? 207 : 201; // 207 Multi-Status jika ada error
    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error("SellIn POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data" },
      { status: 500 }
    );
  }
}
