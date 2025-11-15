CREATE TABLE "do_penjualan" (
	"id" serial PRIMARY KEY NOT NULL,
	"so_number" varchar(255),
	"so_date" timestamp,
	"so_state" varchar(255),
	"cash_or_credit" varchar(255),
	"top" varchar(255),
	"customer_code" varchar(255),
	"customer_name" varchar(255),
	"ktp" varchar(255),
	"alamat" varchar(255),
	"kota" varchar(255),
	"kecamatan" varchar(255),
	"birthday" timestamp,
	"phone_number" varchar(255),
	"pos" varchar(255),
	"color" varchar(255),
	"quantity" integer,
	"year" varchar(255),
	"engine_number" varchar(255),
	"chassis_number" varchar(255),
	"product_category" varchar(255),
	"sales_pic" varchar(255),
	"sales_force" varchar(255),
	"jabatan_sales_force" varchar(255),
	"main_dealer" varchar(255),
	"sales_source" varchar(255),
	"source_document" varchar(255),
	"jp_po" integer,
	"tenor" integer,
	"branch_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sho" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255),
	"color" varchar(255),
	"location" varchar(255),
	"quantity" integer,
	"date_grn" timestamp,
	"rangka_number" varchar(255),
	"year" varchar(255),
	"position_stock" varchar(255),
	"status" varchar(255),
	"count" integer,
	"umur_stock" integer,
	"umur_mutasi" integer,
	"source_doc" varchar(255),
	"source_branch" varchar(255),
	"date" timestamp,
	"branch_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stu" (
	"id" serial PRIMARY KEY NOT NULL,
	"machine_number" varchar(255),
	"rangka_number" varchar(255),
	"quantity" integer,
	"date" timestamp,
	"branch_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "do_penjualan" ADD CONSTRAINT "do_penjualan_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "do_penjualan" ADD CONSTRAINT "do_penjualan_type_id_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sho" ADD CONSTRAINT "sho_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sho" ADD CONSTRAINT "sho_type_id_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stu" ADD CONSTRAINT "stu_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stu" ADD CONSTRAINT "stu_type_id_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;