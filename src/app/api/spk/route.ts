import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spk, branches, types, series } from "@/db/schema";
import { eq, ilike, desc, asc, count, or, and } from "drizzle-orm";

// GET - List SPK with pagination, search, and relations
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
          ilike(spk.spkNumber, `%${search}%`),
          ilike(spk.customerName, `%${search}%`),
          ilike(spk.stnkName, `%${search}%`),
          ilike(spk.salesName, `%${search}%`),
          ilike(spk.registerNumber, `%${search}%`),
          ilike(branches.name, `%${search}%`),
          ilike(types.name, `%${search}%`),
          ilike(branches.code, `%${search}%`)
        )
      );
    }

    if (branchId) {
      whereConditions.push(eq(spk.branchId, parseInt(branchId)));
    }

    if (typeId) {
      whereConditions.push(eq(spk.typeId, parseInt(typeId)));
    }

    if (status) {
      whereConditions.push(eq(spk.status, status));
    }

    // Get total count
    const totalQuery = db
      .select({ count: count() })
      .from(spk)
      .leftJoin(branches, eq(spk.branchId, branches.id))
      .leftJoin(types, eq(spk.typeId, types.id))
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
        sortOrder === "asc" ? asc(spk.quantity) : desc(spk.quantity);
    } else if (sortBy === "date") {
      orderCondition = sortOrder === "asc" ? asc(spk.date) : desc(spk.date);
    } else if (sortBy === "spkNumber") {
      orderCondition =
        sortOrder === "asc" ? asc(spk.spkNumber) : desc(spk.spkNumber);
    } else {
      orderCondition =
        sortOrder === "asc" ? asc(spk.createdAt) : desc(spk.createdAt);
    }

    // Get paginated data with relations
    const dataQuery = db
      .select({
        id: spk.id,
        spkNumber: spk.spkNumber,
        date: spk.date,
        customerName: spk.customerName,
        stnkName: spk.stnkName,
        bbn: spk.bbn,
        salesName: spk.salesName,
        salesTeam: spk.salesTeam,
        fincoName: spk.fincoName,
        salesSource: spk.salesSource,
        registerNumber: spk.registerNumber,
        color: spk.color,
        quantity: spk.quantity,
        dpTotal: spk.dpTotal,
        discount: spk.discount,
        credit: spk.credit,
        tenor: spk.tenor,
        status: spk.status,
        cancelReason: spk.cancelReason,
        branchId: spk.branchId,
        typeId: spk.typeId,
        createdAt: spk.createdAt,
        updatedAt: spk.updatedAt,
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
      .from(spk)
      .leftJoin(branches, eq(spk.branchId, branches.id))
      .leftJoin(types, eq(spk.typeId, types.id))
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
    console.error("SPK GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data SPK" },
      { status: 500 }
    );
  }
}

// POST - Create multiple SPK records
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
        // Validate required fields
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

        // Find type by code
        const type = await db
          .select()
          .from(types)
          .where(ilike(types.code, item.typeName))
          .limit(1);

        if (type.length === 0) {
          errors.push({
            index: i,
            error: `Type dengan kode ${item.typeName} tidak ditemukan`,
          });
          continue;
        }

        // Insert SPK record
        const newRecord = await db
          .insert(spk)
          .values({
            spkNumber: item.spkNumber || null,
            date: item.date ? new Date(item.date) : null,
            customerName: item.customerName || null,
            stnkName: item.stnkName || null,
            bbn: item.bbn || null,
            salesName: item.salesName || null,
            salesTeam: item.salesTeam || null,
            fincoName: item.fincoName || null,
            salesSource: item.salesSource || null,
            registerNumber: item.registerNumber || null,
            color: item.color || null,
            quantity: item.quantity || 0,
            dpTotal: item.dpTotal || null,
            discount: item.discount || null,
            credit: item.credit || null,
            tenor: item.tenor || null,
            status: item.status || null,
            cancelReason: item.cancelReason || null,
            category: item.category,
            branchId: branch[0].id,
            typeId: type[0].id,
          })
          .returning();

        results.push({
          index: i,
          data: newRecord[0],
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

    const statusCode = errors.length > 0 ? 207 : 201;
    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error("SPK POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data" },
      { status: 500 }
    );
  }
}
