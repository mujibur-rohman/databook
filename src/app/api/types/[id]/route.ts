import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { types, series } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Get single type by ID (with series info)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID type tidak valid" },
        { status: 400 }
      );
    }

    const result = await db
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
      .where(eq(types.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Type tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result[0],
    });
  } catch (error) {
    console.error("Types GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT - Update type
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, code, description, seriesId } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID type tidak valid" },
        { status: 400 }
      );
    }

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

    const updatedType = await db
      .update(types)
      .set({
        name,
        code,
        description,
        seriesId,
        updatedAt: new Date(),
      })
      .where(eq(types.id, id))
      .returning();

    if (updatedType.length === 0) {
      return NextResponse.json(
        { error: "Type tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Type berhasil diperbarui",
      data: updatedType[0],
    });
  } catch (error: unknown) {
    console.error("Types PUT error:", error);

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

// DELETE - Delete type
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID type tidak valid" },
        { status: 400 }
      );
    }

    const deletedType = await db
      .delete(types)
      .where(eq(types.id, id))
      .returning();

    if (deletedType.length === 0) {
      return NextResponse.json(
        { error: "Type tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Type berhasil dihapus",
    });
  } catch (error) {
    console.error("Types DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
