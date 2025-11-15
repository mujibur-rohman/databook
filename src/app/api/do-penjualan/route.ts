import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doPenjualan, branches, types, series } from "@/db/schema";
import { eq, ilike, desc, asc, count, or, and } from "drizzle-orm";

// GET - List doPenjualan with pagination, search, and relations
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
    const cashOrCredit = searchParams.get("cashOrCredit");

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(doPenjualan.soNumber, `%${search}%`),
          ilike(doPenjualan.customerName, `%${search}%`),
          ilike(doPenjualan.customerCode, `%${search}%`),
          ilike(doPenjualan.engineNumber, `%${search}%`),
          ilike(doPenjualan.chassisNumber, `%${search}%`),
          ilike(doPenjualan.salesPic, `%${search}%`),
          ilike(branches.name, `%${search}%`),
          ilike(types.name, `%${search}%`),
          ilike(branches.code, `%${search}%`)
        )
      );
    }

    if (branchId) {
      whereConditions.push(eq(doPenjualan.branchId, parseInt(branchId)));
    }

    if (typeId) {
      whereConditions.push(eq(doPenjualan.typeId, parseInt(typeId)));
    }

    if (cashOrCredit) {
      whereConditions.push(eq(doPenjualan.cashOrCredit, cashOrCredit));
    }

    // Get total count
    const totalQuery = db
      .select({ count: count() })
      .from(doPenjualan)
      .leftJoin(branches, eq(doPenjualan.branchId, branches.id))
      .leftJoin(types, eq(doPenjualan.typeId, types.id))
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
        sortOrder === "asc"
          ? asc(doPenjualan.quantity)
          : desc(doPenjualan.quantity);
    } else if (sortBy === "soDate") {
      orderCondition =
        sortOrder === "asc"
          ? asc(doPenjualan.soDate)
          : desc(doPenjualan.soDate);
    } else if (sortBy === "customerName") {
      orderCondition =
        sortOrder === "asc"
          ? asc(doPenjualan.customerName)
          : desc(doPenjualan.customerName);
    } else if (sortBy === "soNumber") {
      orderCondition =
        sortOrder === "asc"
          ? asc(doPenjualan.soNumber)
          : desc(doPenjualan.soNumber);
    } else {
      orderCondition =
        sortOrder === "asc"
          ? asc(doPenjualan.createdAt)
          : desc(doPenjualan.createdAt);
    }

    // Get paginated data with relations
    const dataQuery = db
      .select({
        id: doPenjualan.id,
        soNumber: doPenjualan.soNumber,
        soDate: doPenjualan.soDate,
        soState: doPenjualan.soState,
        cashOrCredit: doPenjualan.cashOrCredit,
        top: doPenjualan.top,
        customerCode: doPenjualan.customerCode,
        customerName: doPenjualan.customerName,
        ktp: doPenjualan.ktp,
        alamat: doPenjualan.alamat,
        kota: doPenjualan.kota,
        kecamatan: doPenjualan.kecamatan,
        birthday: doPenjualan.birthday,
        phoneNumber: doPenjualan.phoneNumber,
        pos: doPenjualan.pos,
        color: doPenjualan.color,
        quantity: doPenjualan.quantity,
        year: doPenjualan.year,
        engineNumber: doPenjualan.engineNumber,
        chassisNumber: doPenjualan.chassisNumber,
        productCategory: doPenjualan.productCategory,
        salesPic: doPenjualan.salesPic,
        salesForce: doPenjualan.salesForce,
        jabatanSalesForce: doPenjualan.jabatanSalesForce,
        mainDealer: doPenjualan.mainDealer,
        salesSource: doPenjualan.salesSource,
        sourceDocument: doPenjualan.sourceDocument,
        jpPo: doPenjualan.jpPo,
        tenor: doPenjualan.tenor,
        branchId: doPenjualan.branchId,
        typeId: doPenjualan.typeId,
        createdAt: doPenjualan.createdAt,
        updatedAt: doPenjualan.updatedAt,
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
      .from(doPenjualan)
      .leftJoin(branches, eq(doPenjualan.branchId, branches.id))
      .leftJoin(types, eq(doPenjualan.typeId, types.id))
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
    console.error("DO Penjualan GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data DO Penjualan" },
      { status: 500 }
    );
  }
}
