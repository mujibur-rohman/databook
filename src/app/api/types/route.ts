import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { types, series } from "@/db/schema";
import { ilike, desc, asc, count, or, eq } from "drizzle-orm";

// GET - List types with pagination and search (with series info)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const seriesId = searchParams.get("seriesId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(types.name, `%${search}%`),
          ilike(types.code, `%${search}%`),
          ilike(types.description, `%${search}%`)
        )
      );
    }

    if (seriesId && !isNaN(parseInt(seriesId))) {
      whereConditions.push(eq(types.seriesId, parseInt(seriesId)));
    }

    const whereCondition =
      whereConditions.length > 0
        ? whereConditions.reduce((acc, condition) => acc && condition)
        : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(types)
      .where(whereCondition);

    const total = totalResult[0].count;

    // Build order condition
    let orderCondition;
    if (sortBy === "name") {
      orderCondition = sortOrder === "asc" ? asc(types.name) : desc(types.name);
    } else if (sortBy === "code") {
      orderCondition = sortOrder === "asc" ? asc(types.code) : desc(types.code);
    } else if (sortBy === "description") {
      orderCondition =
        sortOrder === "asc" ? asc(types.description) : desc(types.description);
    } else {
      orderCondition =
        sortOrder === "asc" ? asc(types.createdAt) : desc(types.createdAt);
    }

    // Get paginated data with series info
    const data = await db
      .select({
        id: types.id,
        name: types.name,
        code: types.code,
        description: types.description,
        seriesId: types.seriesId,
        createdAt: types.createdAt,
        updatedAt: types.updatedAt,
        series: {
          id: series.id,
          name: series.name,
        },
      })
      .from(types)
      .leftJoin(series, eq(types.seriesId, series.id))
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
    console.error("Types GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST - Create new type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description, seriesId } = body;

    if (!name || !code || !description || !seriesId) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Check if series exists
    const seriesExists = await db
      .select()
      .from(series)
      .where(eq(series.id, seriesId))
      .limit(1);

    if (seriesExists.length === 0) {
      return NextResponse.json(
        { error: "Series tidak ditemukan" },
        { status: 400 }
      );
    }

    const newType = await db
      .insert(types)
      .values({
        name,
        code,
        description,
        seriesId,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Type berhasil dibuat",
        data: newType[0],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Types POST error:", error);

    // Handle unique constraint error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "Kode type sudah digunakan" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
