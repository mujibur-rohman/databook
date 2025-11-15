CREATE TABLE "supply" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier" varchar(255),
	"sj_supplier" varchar(255),
	"bpb" varchar(255),
	"color" varchar(255),
	"status" varchar(255),
	"machine_number" varchar(255),
	"rangka_number" varchar(255),
	"price" integer,
	"discount" integer,
	"ap_unit" integer,
	"quantity" integer,
	"faktur" varchar(255),
	"faktur_date" timestamp,
	"date" timestamp,
	"branch_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "supply" ADD CONSTRAINT "supply_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supply" ADD CONSTRAINT "supply_type_id_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;