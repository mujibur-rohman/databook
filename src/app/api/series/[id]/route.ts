import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { series } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Get single series by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID series tidak valid" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(series)
      .where(eq(series.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Series tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result[0],
    });
  } catch (error) {
    console.error("Series GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT - Update series
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID series tidak valid" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Nama series harus diisi" },
        { status: 400 }
      );
    }

    const updatedSeries = await db
      .update(series)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(series.id, id))
      .returning();

    if (updatedSeries.length === 0) {
      return NextResponse.json(
        { error: "Series tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Series berhasil diperbarui",
      data: updatedSeries[0],
    });
  } catch (error) {
    console.error("Series PUT error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE - Delete series
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID series tidak valid" },
        { status: 400 }
      );
    }

    const deletedSeries = await db
      .delete(series)
      .where(eq(series.id, id))
      .returning();

    if (deletedSeries.length === 0) {
      return NextResponse.json(
        { error: "Series tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Series berhasil dihapus",
    });
  } catch (error) {
    console.error("Series DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
