-- ============================================================================
-- Code automatically generated from schema.dbml
-- DO NOT EDIT MANUALLY.
-- ============================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE "project_metadata" (
  "key" varchar PRIMARY KEY,
  "value" text NOT NULL
);

CREATE TABLE "lego_colors" (
  "id" integer PRIMARY KEY,
  "name" varchar NOT NULL,
  "hex" varchar(7) NOT NULL
);

CREATE TABLE "assets" (
  "id" varchar(36) PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "bbox_x" integer,
  "bbox_y" integer,
  "bbox_width" integer,
  "bbox_height" integer,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "cells" (
  "asset_id" varchar(36) NOT NULL,
  "x" integer NOT NULL,
  "y" integer NOT NULL,
  "color_id" integer NOT NULL,
  PRIMARY KEY ("asset_id", "x", "y"),
  FOREIGN KEY ("asset_id") REFERENCES "assets" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("color_id") REFERENCES "lego_colors" ("id") ON DELETE RESTRICT
);

CREATE INDEX "idx_cells_spatial" ON "cells" ("asset_id", "x", "y");

INSERT OR IGNORE INTO project_metadata (key, value) VALUES ('schema_version', '1');
