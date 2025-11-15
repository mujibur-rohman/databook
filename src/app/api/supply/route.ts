import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supply, branches, types, series } from "@/db/schema";
import { eq, ilike, desc, asc, count, or, and } from "drizzle-orm";

// GET - List supply with pagination, search, and relations
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
          ilike(supply.supplier, `%${search}%`),
          ilike(supply.sjSupplier, `%${search}%`),
          ilike(supply.bpb, `%${search}%`),
          ilike(supply.color, `%${search}%`),
          ilike(supply.status, `%${search}%`),
          ilike(supply.machineNumber, `%${search}%`),
          ilike(supply.rangkaNumber, `%${search}%`),
          ilike(supply.faktur, `%${search}%`),
          ilike(branches.name, `%${search}%`),
          ilike(types.name, `%${search}%`),
          ilike(branches.code, `%${search}%`)
        )
      );
    }

    if (branchId) {
      whereConditions.push(eq(supply.branchId, parseInt(branchId)));
    }

    if (typeId) {
      whereConditions.push(eq(supply.typeId, parseInt(typeId)));
    }

    if (status) {
      whereConditions.push(eq(supply.status, status));
    }

    // Get total count
    const totalQuery = db
      .select({ count: count() })
      .from(supply)
      .leftJoin(branches, eq(supply.branchId, branches.id))
      .leftJoin(types, eq(supply.typeId, types.id))
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
        sortOrder === "asc" ? asc(supply.quantity) : desc(supply.quantity);
    } else if (sortBy === "price") {
      orderCondition =
        sortOrder === "asc" ? asc(supply.price) : desc(supply.price);
    } else if (sortBy === "date") {
      orderCondition =
        sortOrder === "asc" ? asc(supply.date) : desc(supply.date);
    } else if (sortBy === "fakturDate") {
      orderCondition =
        sortOrder === "asc" ? asc(supply.fakturDate) : desc(supply.fakturDate);
    } else if (sortBy === "supplier") {
      orderCondition =
        sortOrder === "asc" ? asc(supply.supplier) : desc(supply.supplier);
    } else {
      orderCondition =
        sortOrder === "asc" ? asc(supply.createdAt) : desc(supply.createdAt);
    }

    // Get paginated data with relations
    const dataQuery = db
      .select({
        id: supply.id,
        supplier: supply.supplier,
        sjSupplier: supply.sjSupplier,
        bpb: supply.bpb,
        color: supply.color,
        status: supply.status,
        machineNumber: supply.machineNumber,
        rangkaNumber: supply.rangkaNumber,
        price: supply.price,
        discount: supply.discount,
        apUnit: supply.apUnit,
        quantity: supply.quantity,
        faktur: supply.faktur,
        fakturDate: supply.fakturDate,
        date: supply.date,
        branchId: supply.branchId,
        typeId: supply.typeId,
        createdAt: supply.createdAt,
        updatedAt: supply.updatedAt,
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
      .from(supply)
      .leftJoin(branches, eq(supply.branchId, branches.id))
      .leftJoin(types, eq(supply.typeId, types.id))
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
    console.error("Supply GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data supply" },
      { status: 500 }
    );
  }
}
