import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261111083503 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "vehicle_model" drop constraint if exists "vehicle_model_make_id_slug_unique";`
    )
    this.addSql(
      `alter table if exists "vehicle_make" drop constraint if exists "vehicle_make_slug_unique";`
    )
    this.addSql(
      `create table if not exists "vehicle_make" ("id" text not null, "name" text not null, "slug" text not null, "logo_url" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vehicle_make_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vehicle_make_slug_unique" ON "vehicle_make" ("slug") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_vehicle_make_deleted_at" ON "vehicle_make" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "vehicle_model" ("id" text not null, "name" text not null, "slug" text not null, "body_type" text check ("body_type" in ('hatchback', 'sedan', 'suv', 'compact_suv', 'muv', 'pickup', 'coupe')) not null, "make_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vehicle_model_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_vehicle_model_make_id" ON "vehicle_model" ("make_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_vehicle_model_deleted_at" ON "vehicle_model" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vehicle_model_make_id_slug_unique" ON "vehicle_model" ("make_id", "slug") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "vehicle_generation" ("id" text not null, "name" text not null, "year_from" integer not null, "year_to" integer null, "model_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vehicle_generation_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_vehicle_generation_model_id" ON "vehicle_generation" ("model_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_vehicle_generation_deleted_at" ON "vehicle_generation" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "vehicle_variant" ("id" text not null, "name" text not null, "fuel" text check ("fuel" in ('petrol', 'diesel', 'cng', 'electric', 'hybrid')) not null, "transmission" text check ("transmission" in ('manual', 'automatic')) not null, "seats" integer null, "generation_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vehicle_variant_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_vehicle_variant_generation_id" ON "vehicle_variant" ("generation_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_vehicle_variant_deleted_at" ON "vehicle_variant" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "fitment" ("id" text not null, "product_id" text not null, "notes" text null, "position" text null, "verified" boolean not null default false, "generation_id" text null, "variant_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "fitment_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_fitment_product_id" ON "fitment" ("product_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_fitment_generation_id" ON "fitment" ("generation_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_fitment_variant_id" ON "fitment" ("variant_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_fitment_deleted_at" ON "fitment" ("deleted_at") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `alter table if exists "vehicle_model" add constraint "vehicle_model_make_id_foreign" foreign key ("make_id") references "vehicle_make" ("id") on update cascade;`
    )

    this.addSql(
      `alter table if exists "vehicle_generation" add constraint "vehicle_generation_model_id_foreign" foreign key ("model_id") references "vehicle_model" ("id") on update cascade;`
    )

    this.addSql(
      `alter table if exists "vehicle_variant" add constraint "vehicle_variant_generation_id_foreign" foreign key ("generation_id") references "vehicle_generation" ("id") on update cascade;`
    )

    this.addSql(
      `alter table if exists "fitment" add constraint "fitment_generation_id_foreign" foreign key ("generation_id") references "vehicle_generation" ("id") on update cascade on delete set null;`
    )
    this.addSql(
      `alter table if exists "fitment" add constraint "fitment_variant_id_foreign" foreign key ("variant_id") references "vehicle_variant" ("id") on update cascade on delete set null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "vehicle_model" drop constraint if exists "vehicle_model_make_id_foreign";`
    )

    this.addSql(
      `alter table if exists "vehicle_generation" drop constraint if exists "vehicle_generation_model_id_foreign";`
    )

    this.addSql(
      `alter table if exists "vehicle_variant" drop constraint if exists "vehicle_variant_generation_id_foreign";`
    )

    this.addSql(
      `alter table if exists "fitment" drop constraint if exists "fitment_generation_id_foreign";`
    )

    this.addSql(
      `alter table if exists "fitment" drop constraint if exists "fitment_variant_id_foreign";`
    )

    this.addSql(`drop table if exists "vehicle_make" cascade;`)

    this.addSql(`drop table if exists "vehicle_model" cascade;`)

    this.addSql(`drop table if exists "vehicle_generation" cascade;`)

    this.addSql(`drop table if exists "vehicle_variant" cascade;`)

    this.addSql(`drop table if exists "fitment" cascade;`)
  }
}
