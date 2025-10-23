import { hashPassword } from "@/lib/auth";
import { db } from "../src/db";
import { branches, series, types, users } from "../src/db/schema";
import { BRANCHES_DATA, SERIES_DATA, TYPES_DATA } from "./data";

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Create admin user
    const hashedAdminPassword = await hashPassword("admin123");
    console.log(hashedAdminPassword);
    const adminUser = await db
      .insert(users)
      .values({
        username: "admin",
        password: `${hashedAdminPassword}`,
        isActive: true,
      })
      .returning();

    console.log("✅ Admin user created:", adminUser[0]);

    const sampleBranches = await db
      .insert(branches)
      .values(BRANCHES_DATA.map((b) => ({ name: b.name, code: b.code })))
      .returning();

    console.log("✅ Sample branches created:", sampleBranches.length);

    const sampleSeries = await db
      .insert(series)
      .values(SERIES_DATA.map((s) => ({ name: s.name })))
      .returning();

    console.log("✅ Sample series created:", sampleSeries.length);

    const sampleTypes = await db
      .insert(types)
      .values(
        TYPES_DATA.map((t) => ({
          name: t.descriptionUnit,
          code: t.code,
          description: t.descriptionUnit,
          seriesId: t.seriesId,
        }))
      )
      .returning();
    console.log("✅ Sample Type created:", sampleTypes.length);

    console.log("\n🎉 Database seeded successfully!");
    console.log("📋 Login credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
