import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spk } from "@/db/schema";
import { inArray } from "drizzle-orm";

// DELETE - Batch delete SPK records for rollback functionality
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: "IDs array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    const validIds = body.ids.filter(
      (id: unknown) => typeof id === "number" && id > 0
    ) as number[];

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid IDs provided" },
        { status: 400 }
      );
    }

    // Delete records with the provided IDs
    const deletedRecords = await db
      .delete(spk)
      .where(inArray(spk.id, validIds))
      .returning({
        id: spk.id,
        spkNumber: spk.spkNumber,
        customerName: spk.customerName,
      });

    return NextResponse.json({
      message: `Successfully deleted ${deletedRecords.length} records`,
      deletedCount: deletedRecords.length,
      deletedIds: deletedRecords.map((record) => record.id),
      deletedRecords: deletedRecords,
    });
  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data" },
      { status: 500 }
    );
  }
}
