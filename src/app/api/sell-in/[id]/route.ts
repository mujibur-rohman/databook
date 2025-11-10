import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sellIn, branches, types, series } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SellInUpdateData {
  quantity?: number;
  sellDate?: string;
  description?: string;
  branchCode?: string;
  typeName?: string;
}

// GET - Get single sell_in by ID with relations
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const data = await db
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
      .where(eq(sellIn.id, id))
      .limit(1);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Data sell in tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: data[0] });
  } catch (error) {
    console.error("SellIn GET by ID error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data" },
      { status: 500 }
    );
  }
}

// PUT - Update sell_in by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body: SellInUpdateData = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Check if sell_in exists
    const existing = await db
      .select()
      .from(sellIn)
      .where(eq(sellIn.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Data sell in tidak ditemukan" },
        { status: 404 }
      );
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.quantity !== undefined) {
      updateData.quantity = body.quantity;
    }

    if (body.sellDate !== undefined) {
      updateData.sellDate = new Date(body.sellDate);
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    // Handle branchCode update
    if (body.branchCode !== undefined) {
      const branch = await db
        .select()
        .from(branches)
        .where(eq(branches.code, body.branchCode))
        .limit(1);

      if (branch.length === 0) {
        return NextResponse.json(
          { error: `Branch dengan kode ${body.branchCode} tidak ditemukan` },
          { status: 400 }
        );
      }
      updateData.branchId = branch[0].id;
    }

    // Handle typeName update
    if (body.typeName !== undefined) {
      const type = await db
        .select()
        .from(types)
        .where(eq(types.name, body.typeName))
        .limit(1);

      if (type.length === 0) {
        return NextResponse.json(
          { error: `Type dengan nama ${body.typeName} tidak ditemukan` },
          { status: 400 }
        );
      }
      updateData.typeId = type[0].id;
    }

    // Update sell_in
    const result = await db
      .update(sellIn)
      .set(updateData)
      .where(eq(sellIn.id, id))
      .returning();

    return NextResponse.json({
      message: "Data sell in berhasil diperbarui",
      data: result[0],
    });
  } catch (error) {
    console.error("SellIn PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui data" },
      { status: 500 }
    );
  }
}

// DELETE - Delete sell_in by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    // Check if sell_in exists
    const existing = await db
      .select()
      .from(sellIn)
      .where(eq(sellIn.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Data sell in tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete sell_in
    await db.delete(sellIn).where(eq(sellIn.id, id));

    return NextResponse.json({
      message: "Data sell in berhasil dihapus",
    });
  } catch (error) {
    console.error("SellIn DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data" },
      { status: 500 }
    );
  }
}
