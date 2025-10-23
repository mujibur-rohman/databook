import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { branches } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Get single branch by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID branch tidak valid" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(branches)
      .where(eq(branches.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Branch tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: result[0],
    });
  } catch (error) {
    console.error("Branches GET error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT - Update branch
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, code } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID branch tidak valid" },
        { status: 400 }
      );
    }

    if (!name || !code) {
      return NextResponse.json(
        { error: "Nama dan kode branch harus diisi" },
        { status: 400 }
      );
    }

    const updatedBranch = await db
      .update(branches)
      .set({
        name,
        code,
        updatedAt: new Date(),
      })
      .where(eq(branches.id, id))
      .returning();

    if (updatedBranch.length === 0) {
      return NextResponse.json(
        { error: "Branch tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Branch berhasil diperbarui",
      data: updatedBranch[0],
    });
  } catch (error: unknown) {
    console.error("Branches PUT error:", error);

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

// DELETE - Delete branch
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID branch tidak valid" },
        { status: 400 }
      );
    }

    const deletedBranch = await db
      .delete(branches)
      .where(eq(branches.id, id))
      .returning();

    if (deletedBranch.length === 0) {
      return NextResponse.json(
        { error: "Branch tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Branch berhasil dihapus",
    });
  } catch (error) {
    console.error("Branches DELETE error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
