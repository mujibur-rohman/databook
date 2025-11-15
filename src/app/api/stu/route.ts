import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stu, branches, types, series } from "@/db/schema";
import { eq, ilike, desc, asc, count, or, and } from "drizzle-orm";

// GET - List stu with pagination, search, and relations
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
          ilike(stu.machineNumber, `%${search}%`),
          ilike(stu.rangkaNumber, `%${search}%`),
          ilike(branches.name, `%${search}%`),
          ilike(types.name, `%${search}%`),
          ilike(branches.code, `%${search}%`)
        )
      );
    }

    if (branchId) {
      whereConditions.push(eq(stu.branchId, parseInt(branchId)));
    }

    if (typeId) {
      whereConditions.push(eq(stu.typeId, parseInt(typeId)));
    }

    // Get total count
    const totalQuery = db
      .select({ count: count() })
      .from(stu)
      .leftJoin(branches, eq(stu.branchId, branches.id))
      .leftJoin(types, eq(stu.typeId, types.id))
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
        sortOrder === "asc" ? asc(stu.quantity) : desc(stu.quantity);
    } else if (sortBy === "date") {
      orderCondition = sortOrder === "asc" ? asc(stu.date) : desc(stu.date);
    } else if (sortBy === "machineNumber") {
      orderCondition =
        sortOrder === "asc" ? asc(stu.machineNumber) : desc(stu.machineNumber);
    } else {
      orderCondition =
        sortOrder === "asc" ? asc(stu.createdAt) : desc(stu.createdAt);
    }

    // Get paginated data with relations
    const dataQuery = db
      .select({
        id: stu.id,
        machineNumber: stu.machineNumber,
        rangkaNumber: stu.rangkaNumber,
        quantity: stu.quantity,
        date: stu.date,
        branchId: stu.branchId,
        typeId: stu.typeId,
        createdAt: stu.createdAt,
        updatedAt: stu.updatedAt,
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
      .from(stu)
      .leftJoin(branches, eq(stu.branchId, branches.id))
      .leftJoin(types, eq(stu.typeId, types.id))
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
    console.error("STU GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data STU" },
      { status: 500 }
    );
  }
}
