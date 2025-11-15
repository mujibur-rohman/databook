import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Branch table
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Series table
export const series = pgTable("series", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Types table
export const types = pgTable("types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }).notNull().unique(),
  seriesId: serial("series_id")
    .notNull()
    .references(() => series.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sell in table
export const sellIn = pgTable("sell_in", {
  id: serial("id").primaryKey(),
  quantity: integer("quantity").notNull(),
  sellDate: timestamp("sell_date").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  typeId: integer("type_id")
    .notNull()
    .references(() => types.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Supply table
export const supply = pgTable("supply", {
  id: serial("id").primaryKey(),
  supplier: varchar("supplier", { length: 255 }),
  sjSupplier: varchar("sj_supplier", { length: 255 }),
  bpb: varchar("bpb", { length: 255 }),
  color: varchar("color", { length: 255 }),
  status: varchar("status", { length: 255 }),
  machineNumber: varchar("machine_number", { length: 255 }),
  rangkaNumber: varchar("rangka_number", { length: 255 }),
  price: integer("price"),
  discount: integer("discount"),
  apUnit: integer("ap_unit"),
  quantity: integer("quantity"),
  faktur: varchar("faktur", { length: 255 }),
  fakturDate: timestamp("faktur_date"),
  date: timestamp("date"),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  typeId: integer("type_id")
    .notNull()
    .references(() => types.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Do Penjualan table
export const doPenjualan = pgTable("do_penjualan", {
  id: serial("id").primaryKey(),
  soNumber: varchar("so_number", { length: 255 }),
  soDate: timestamp("so_date"),
  soState: varchar("so_state", { length: 255 }),
  cashOrCredit: varchar("cash_or_credit", { length: 255 }),
  top: varchar("top", { length: 255 }),
  customerCode: varchar("customer_code", { length: 255 }),
  customerName: varchar("customer_name", { length: 255 }),
  ktp: varchar("ktp", { length: 255 }),
  alamat: varchar("alamat", { length: 255 }),
  kota: varchar("kota", { length: 255 }),
  kecamatan: varchar("kecamatan", { length: 255 }),
  birthday: timestamp("birthday"),
  phoneNumber: varchar("phone_number", { length: 255 }),
  pos: varchar("pos", { length: 255 }),
  color: varchar("color", { length: 255 }),
  quantity: integer("quantity"),
  year: varchar("year", { length: 255 }),
  engineNumber: varchar("engine_number", { length: 255 }),
  chassisNumber: varchar("chassis_number", { length: 255 }),
  productCategory: varchar("product_category", { length: 255 }),
  salesPic: varchar("sales_pic", { length: 255 }),
  salesForce: varchar("sales_force", { length: 255 }),
  jabatanSalesForce: varchar("jabatan_sales_force", { length: 255 }),
  mainDealer: varchar("main_dealer", { length: 255 }),
  salesSource: varchar("sales_source", { length: 255 }),
  sourceDocument: varchar("source_document", { length: 255 }),
  jpPo: integer("jp_po"),
  tenor: integer("tenor"),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  typeId: integer("type_id")
    .notNull()
    .references(() => types.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// STU table
export const stu = pgTable("stu", {
  id: serial("id").primaryKey(),
  machineNumber: varchar("machine_number", { length: 255 }),
  rangkaNumber: varchar("rangka_number", { length: 255 }),
  quantity: integer("quantity"),
  date: timestamp("date"),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  typeId: integer("type_id")
    .notNull()
    .references(() => types.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// SHO table
export const sho = pgTable("sho", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 255 }),
  color: varchar("color", { length: 255 }),
  location: varchar("location", { length: 255 }),
  quantity: integer("quantity"),
  dateGrn: timestamp("date_grn"),
  rangkaNumber: varchar("rangka_number", { length: 255 }),
  year: varchar("year", { length: 255 }),
  positionStock: varchar("position_stock", { length: 255 }),
  status: varchar("status", { length: 255 }),
  count: integer("count"),
  umurStock: integer("umur_stock"),
  umurMutasi: integer("umur_mutasi"),
  sourceDoc: varchar("source_doc", { length: 255 }),
  sourceBranch: varchar("source_branch", { length: 255 }),
  date: timestamp("date"),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  typeId: integer("type_id")
    .notNull()
    .references(() => types.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
export type Series = typeof series.$inferSelect;
export type NewSeries = typeof series.$inferInsert;
export type Type = typeof types.$inferSelect;
export type NewType = typeof types.$inferInsert;
export type SellIn = typeof sellIn.$inferSelect;
export type NewSellIn = typeof sellIn.$inferInsert;
