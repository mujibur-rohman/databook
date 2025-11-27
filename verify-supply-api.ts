import { db } from "./src/db";
import { supply, branches, types } from "./src/db/schema";
import { eq, inArray } from "drizzle-orm";

async function verifySupplyApi() {
  console.log("Starting Supply API Verification...");

  // 1. Setup: Ensure we have a branch and type to work with
  const branch = await db.query.branches.findFirst();
  const type = await db.query.types.findFirst();

  if (!branch || !type) {
    console.error("Error: No branch or type found in database. Cannot verify.");
    return;
  }

  console.log(`Using Branch: ${branch.code}, Type: ${type.name}`);

  // 2. Test POST (Simulate API call logic)
  console.log("\nTesting POST logic...");
  const mockData = [
    {
      branchCode: branch.code,
      typeName: type.name,
      quantity: 5,
      pricePerUnit: 1000000,
      status: "Available",
      supplier: "Test Supplier",
    },
    {
      branchCode: branch.code,
      typeName: type.name,
      quantity: 3,
      pricePerUnit: 2000000,
      status: "Sold",
      supplier: "Test Supplier",
    },
  ];

  const insertedIds: number[] = [];

  for (const item of mockData) {
    const newSupply = await db
      .insert(supply)
      .values({
        branchId: branch.id,
        typeId: type.id,
        quantity: item.quantity,
        price: item.pricePerUnit,
        status: item.status,
        supplier: item.supplier,
        // other fields null
      })
      .returning();

    insertedIds.push(newSupply[0].id);
    console.log(`Inserted Supply ID: ${newSupply[0].id}`);
  }

  if (insertedIds.length !== 2) {
    console.error("Failed to insert mock data.");
    return;
  }
  console.log("POST logic verified: Data inserted successfully.");

  // 3. Test DELETE (Batch Delete)
  console.log("\nTesting DELETE logic (Rollback)...");

  // Verify they exist first
  const beforeDelete = await db.query.supply.findMany({
    where: (supply, { inArray }) => inArray(supply.id, insertedIds),
  });
  console.log(`Records found before delete: ${beforeDelete.length}`);

  if (beforeDelete.length !== 2) {
    console.error("Error: Records not found before delete.");
    return;
  }

  // Perform delete
  const deleted = await db
    .delete(supply)
    .where(inArray(supply.id, insertedIds))
    .returning();

  console.log(`Deleted records count: ${deleted.length}`);

  // Verify they are gone
  const afterDelete = await db.query.supply.findMany({
    where: (supply, { inArray }) => inArray(supply.id, insertedIds),
  });
  console.log(`Records found after delete: ${afterDelete.length}`);

  if (deleted.length === 2 && afterDelete.length === 0) {
    console.log("DELETE logic verified: Data rolled back successfully.");
  } else {
    console.error("DELETE logic failed.");
  }

  console.log("\nVerification Complete.");
  process.exit(0);
}

verifySupplyApi().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
