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

// POST - Create multiple supply records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
        // Validate required fields - adjusted based on schema
        // Note: supply table has many nullable fields, but branchCode and typeName are required for relations
        if (!item.branchCode || !item.typeName) {
          errors.push({
            index: i,
            error: "Branch Code dan Type Name wajib diisi",
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

        // Insert supply record
        const newSupply = await db
          .insert(supply)
          .values({
            supplier: item.supplier || null,
            sjSupplier: item.sjSupplier || null,
            bpb: item.bpbNo || null, // Map bpbNo from frontend to bpb in db
            color: item.color || null,
            status: item.status || null,
            machineNumber: item.machineNumber || null,
            rangkaNumber: item.frameNumber || null, // Map frameNumber from frontend to rangkaNumber in db
            price: item.pricePerUnit || null, // Map pricePerUnit from frontend to price in db
            discount: item.discount || null,
            apUnit: item.apUnit || null,
            quantity: item.quantity || 0,
            faktur: item.faktur || null,
            fakturDate: item.fakturDate ? new Date(item.fakturDate) : null,
            date: item.date ? new Date(item.date) : null,
            branchId: branch[0].id,
            typeId: type[0].id,
          })
          .returning();

        results.push({
          index: i,
          data: newSupply[0],
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
    console.error("Supply POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data" },
      { status: 500 }
    );
  }
}
