-- ============================================================================
-- Code automatically generated from schema.dbml
-- DO NOT EDIT MANUALLY.
-- ============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE "schema_migrations" (
  "version" integer PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "applied_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "assets" (
  "id" varchar(36) PRIMARY KEY NOT NULL CHECK (id = (data ->> '$.id')),
  "name" varchar(100) GENERATED ALWAYS AS ((data ->> '$.name')) STORED NOT NULL,
  "width" integer GENERATED ALWAYS AS ((data ->> '$.width')) STORED NOT NULL,
  "height" integer GENERATED ALWAYS AS ((data ->> '$.height')) STORED NOT NULL,
  "painted_cells_count" integer GENERATED ALWAYS AS ((data ->> '$.paintedCellsCount')) STORED NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "data" blob NOT NULL CHECK (json_valid(data, 4))
);

CREATE INDEX "idx_assets_created_at" ON "assets" ("created_at");

INSERT OR IGNORE INTO "schema_migrations" ("version", "name") VALUES (1, '0001_initial_schema');
