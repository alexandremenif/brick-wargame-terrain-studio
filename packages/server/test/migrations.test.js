import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../src/persistence/migrations');
const dbmlPath = path.resolve(__dirname, '../../../specs/server/schema.dbml');

/**
 * Programmatically extracts table names declared in a DBML file.
 * Matches `Table <table_name> {`.
 */
function extractTablesFromDbml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = [...content.matchAll(/^\s*Table\s+(\w+)\s*\{/gm)];
  return matches.map(m => m[1]);
}

/**
 * Programmatically extracts index names declared in a DBML file.
 * Matches `name: '<index_name>'`.
 */
function extractIndicesFromDbml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = [...content.matchAll(/name:\s*'([^']+)'/g)];
  return matches.map(m => m[1]);
}

/**
 * Retrieves all migration SQL files sorted in alphabetical/numeric sequence.
 */
function getMigrationFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

describe('SQLite Migrations Sequential Execution', () => {
  test('executes all migration files in sequence and verifies schema against schema.dbml', () => {
    const migrationFiles = getMigrationFiles(migrationsDir);
    assert.ok(migrationFiles.length > 0, 'At least one migration file must exist in src/persistence/migrations/');

    // Programmatically extract expected tables and indices from schema.dbml
    assert.ok(fs.existsSync(dbmlPath), 'schema.dbml must exist in specs/server/');
    const dbmlTables = extractTablesFromDbml(dbmlPath);
    const dbmlIndices = extractIndicesFromDbml(dbmlPath);

    assert.ok(dbmlTables.length > 0, 'schema.dbml must declare tables');
    assert.ok(dbmlIndices.length > 0, 'schema.dbml must declare indices');

    const db = new Database(':memory:');

    // Execute each migration script in sequential order
    for (const migrationFile of migrationFiles) {
      const fullPath = path.join(migrationsDir, migrationFile);
      const sqlContent = fs.readFileSync(fullPath, 'utf-8');

      assert.doesNotThrow(() => {
        db.exec(sqlContent);
      }, `Migration ${migrationFile} must execute cleanly in SQLite without syntax or dialect errors`);
    }

    // 1. Verify PRAGMA foreign_keys is active in SQLite
    const fkPragma = db.pragma('foreign_keys', { simple: true });
    assert.strictEqual(fkPragma, 1, 'Migrations must enable PRAGMA foreign_keys');

    // 2. Programmatically verify all tables defined in DBML exist in the SQLite database
    const sqliteTables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
      .all()
      .map(row => row.name);

    assert.deepStrictEqual(
      sqliteTables.sort(),
      dbmlTables.sort(),
      'Database tables created by sequential migrations must programmatically match schema.dbml'
    );

    // 3. Programmatically verify custom indices match those declared in schema.dbml
    const sqliteIndices = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_autoindex_%'")
      .all()
      .map(row => row.name);

    assert.deepStrictEqual(
      sqliteIndices.sort(),
      dbmlIndices.sort(),
      'Custom indices created by migrations must programmatically match schema.dbml'
    );

    // 4. Verify schema_migrations records version matching migration sequence count
    const versionRow = db.prepare("SELECT MAX(version) as max_version FROM schema_migrations").get();
    const expectedVersion = migrationFiles.length;
    assert.strictEqual(
      versionRow?.max_version,
      expectedVersion,
      `schema_migrations.version must equal applied migration count (${expectedVersion})`
    );

    db.close();
  });
});
