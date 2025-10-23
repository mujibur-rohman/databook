import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { branches } from "@/db/schema";
import { ilike, desc, asc, count, or } from "drizzle-orm";

// GET - List branches with pagination and search
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
      whereCondition = or(
        ilike(branches.name, `%${search}%`),
        ilike(branches.code, `%${search}%`)
      );
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(branches)
      .where(whereCondition);

    const total = totalResult[0].count;

    // Build order condition
    let orderCondition;
    if (sortBy === "name") {
      orderCondition =
        sortOrder === "asc" ? asc(branches.name) : desc(branches.name);
    } else if (sortBy === "code") {
      orderCondition =
        sortOrder === "asc" ? asc(branches.code) : desc(branches.code);
    } else {
      orderCondition =
        sortOrder === "asc"
          ? asc(branches.createdAt)
          : desc(branches.createdAt);
    }

    // Get paginated data
    const data = await db
      .select()
      .from(branches)
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
    console.error("Branches GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST - Create new branch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Nama dan kode branch harus diisi" },
        { status: 400 }
      );
    }

    const newBranch = await db
      .insert(branches)
      .values({
        name,
        code,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Branch berhasil dibuat",
        data: newBranch[0],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Branches POST error:", error);

    // Handle unique constraint error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(
        { error: "Kode branch sudah digunakan" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
