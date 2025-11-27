CREATE TABLE "spk" (
	"id" serial PRIMARY KEY NOT NULL,
	"spk_number" varchar(255),
	"date" timestamp,
	"customer_name" varchar(255),
	"stnk_name" varchar(255),
	"bbn" varchar(255),
	"sales_name" varchar(255),
	"sales_team" varchar(255),
	"finco_name" varchar(255),
	"sales_source" varchar(255),
	"register_number" varchar(255),
	"color" varchar(255),
	"quantity" integer,
	"dp_total" varchar(255),
	"discount" varchar(255),
	"credit" varchar(255),
	"tenor" varchar(255),
	"cancel_reason" varchar(255),
	"branch_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "spk" ADD CONSTRAINT "spk_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spk" ADD CONSTRAINT "spk_type_id_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;