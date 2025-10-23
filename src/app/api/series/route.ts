import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { series } from "@/db/schema";
import { ilike, desc, asc, count } from "drizzle-orm";

// GET - List series with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // Build where condition
    let whereCondition;
    if (search) {
      whereCondition = ilike(series.name, `%${search}%`);
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(series)
      .where(whereCondition);

    const total = totalResult[0].count;

    // Build order condition
    let orderCondition;
    if (sortBy === "name") {
      orderCondition =
        sortOrder === "asc" ? asc(series.name) : desc(series.name);
    } else {
      orderCondition =
        sortOrder === "asc" ? asc(series.createdAt) : desc(series.createdAt);
    }

    // Get paginated data
    const data = await db
      .select()
      .from(series)
      .where(whereCondition)
      .orderBy(orderCondition)
      .limit(limit)
      .offset(offset);

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
    console.error("Series GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST - Create new series
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nama series harus diisi" },
        { status: 400 }
      );
    }

    const newSeries = await db
      .insert(series)
      .values({
        name,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Series berhasil dibuat",
        data: newSeries[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Series POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
