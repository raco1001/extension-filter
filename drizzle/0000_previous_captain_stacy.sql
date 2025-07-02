CREATE TABLE "custom_extensions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "custom_extensions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "fixed_extensions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	CONSTRAINT "fixed_extensions_name_unique" UNIQUE("name")
);

