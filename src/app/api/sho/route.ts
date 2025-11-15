import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sho, branches, types, series } from "@/db/schema";
import { eq, ilike, desc, asc, count, or, and } from "drizzle-orm";

// GET - List sho with pagination, search, and relations
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
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(sho.category, `%${search}%`),
          ilike(sho.color, `%${search}%`),
          ilike(sho.location, `%${search}%`),
          ilike(sho.rangkaNumber, `%${search}%`),
          ilike(sho.positionStock, `%${search}%`),
          ilike(sho.sourceDoc, `%${search}%`),
          ilike(sho.sourceBranch, `%${search}%`),
          ilike(branches.name, `%${search}%`),
          ilike(types.name, `%${search}%`),
          ilike(branches.code, `%${search}%`)
        )
      );
    }

    if (branchId) {
      whereConditions.push(eq(sho.branchId, parseInt(branchId)));
    }

    if (typeId) {
      whereConditions.push(eq(sho.typeId, parseInt(typeId)));
    }

    if (status) {
      whereConditions.push(eq(sho.status, status));
    }

    // Get total count
    const totalQuery = db
      .select({ count: count() })
      .from(sho)
      .leftJoin(branches, eq(sho.branchId, branches.id))
      .leftJoin(types, eq(sho.typeId, types.id))
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
        sortOrder === "asc" ? asc(sho.quantity) : desc(sho.quantity);
    } else if (sortBy === "umurStock") {
      orderCondition =
        sortOrder === "asc" ? asc(sho.umurStock) : desc(sho.umurStock);
    } else if (sortBy === "dateGrn") {
      orderCondition =
        sortOrder === "asc" ? asc(sho.dateGrn) : desc(sho.dateGrn);
    } else if (sortBy === "date") {
      orderCondition =
        sortOrder === "asc" ? asc(sho.date) : desc(sho.date);
    } else {
      orderCondition =
        sortOrder === "asc" ? asc(sho.createdAt) : desc(sho.createdAt);
    }

    // Get paginated data with relations
    const dataQuery = db
      .select({
        id: sho.id,
        category: sho.category,
        color: sho.color,
        location: sho.location,
        quantity: sho.quantity,
        dateGrn: sho.dateGrn,
        rangkaNumber: sho.rangkaNumber,
        year: sho.year,
        positionStock: sho.positionStock,
        status: sho.status,
        count: sho.count,
        umurStock: sho.umurStock,
        umurMutasi: sho.umurMutasi,
        sourceDoc: sho.sourceDoc,
        sourceBranch: sho.sourceBranch,
        date: sho.date,
        branchId: sho.branchId,
        typeId: sho.typeId,
        createdAt: sho.createdAt,
        updatedAt: sho.updatedAt,
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
      .from(sho)
      .leftJoin(branches, eq(sho.branchId, branches.id))
      .leftJoin(types, eq(sho.typeId, types.id))
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
    console.error("SHO GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data SHO" },
      { status: 500 }
    );
  }
}