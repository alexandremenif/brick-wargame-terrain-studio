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
  "hex" varchar(7) NOT NULL,
  "category" varchar NOT NULL
);

CREATE TABLE "textures" (
  "id" varchar PRIMARY KEY,
  "name" varchar NOT NULL,
  "svg_path" text NOT NULL,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "tilemaps" (
  "id" varchar(36) PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "is_root_map" BOOLEAN NOT NULL DEFAULT 0,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "base_color_id" integer,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY ("base_color_id") REFERENCES "lego_colors" ("id") ON DELETE SET NULL
);

CREATE TABLE "cells" (
  "tilemap_id" varchar(36) NOT NULL,
  "x" integer NOT NULL,
  "y" integer NOT NULL,
  "color_id" integer,
  "texture_id" varchar,
  "texture_rotation" integer DEFAULT 0,
  PRIMARY KEY ("tilemap_id", "x", "y"),
  FOREIGN KEY ("tilemap_id") REFERENCES "tilemaps" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("color_id") REFERENCES "lego_colors" ("id") ON DELETE SET NULL,
  FOREIGN KEY ("texture_id") REFERENCES "textures" ("id") ON DELETE SET NULL
);

CREATE TABLE "preset_instances" (
  "instance_id" varchar(36) PRIMARY KEY,
  "parent_tilemap_id" varchar(36) NOT NULL,
  "preset_id" varchar(36) NOT NULL,
  "x" integer NOT NULL,
  "y" integer NOT NULL,
  "rotation" integer DEFAULT 0,
  "z_index" integer DEFAULT 0,
  "locked" BOOLEAN DEFAULT 0,
  "created_at" timestamp DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY ("parent_tilemap_id") REFERENCES "tilemaps" ("id") ON DELETE CASCADE,
  FOREIGN KEY ("preset_id") REFERENCES "tilemaps" ("id") ON DELETE RESTRICT
);

CREATE TABLE "action_log" (
  "sequence_id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "tilemap_id" varchar(36) NOT NULL,
  "timestamp" timestamp DEFAULT (CURRENT_TIMESTAMP),
  "action_type" varchar NOT NULL,
  "payload_json" text NOT NULL,
  "rollback_json" text NOT NULL,
  "is_undone" BOOLEAN DEFAULT 0,
  FOREIGN KEY ("tilemap_id") REFERENCES "tilemaps" ("id") ON DELETE CASCADE
);

CREATE INDEX "idx_cells_spatial" ON "cells" ("tilemap_id", "x", "y");

CREATE INDEX "idx_instances_parent_zindex" ON "preset_instances" ("parent_tilemap_id", "z_index");

CREATE INDEX "idx_action_log_order" ON "action_log" ("tilemap_id", "sequence_id");

INSERT OR IGNORE INTO project_metadata (key, value) VALUES ('schema_version', '1');
