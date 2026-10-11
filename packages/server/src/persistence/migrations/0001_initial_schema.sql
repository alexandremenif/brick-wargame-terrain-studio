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
  "id" varchar(36) PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "cells" (
  "asset_id" varchar(36) NOT NULL,
  "x" integer NOT NULL,
  "y" integer NOT NULL,
  "color_id" integer NOT NULL,
  PRIMARY KEY ("asset_id", "x", "y"),
  FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") ON DELETE CASCADE
);

CREATE INDEX "idx_cells_spatial" ON "cells" ("asset_id", "x", "y");

INSERT OR IGNORE INTO "schema_migrations" ("version", "name") VALUES (1, '0001_initial_schema');
