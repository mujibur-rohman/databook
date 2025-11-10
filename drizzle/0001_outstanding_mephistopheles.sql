CREATE TABLE "sell_in" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"sell_date" timestamp NOT NULL,
	"description" varchar(255) NOT NULL,
	"branch_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sell_in" ADD CONSTRAINT "sell_in_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sell_in" ADD CONSTRAINT "sell_in_type_id_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;