import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import { compileDbmlToSqlite } from '../src/dbmlCompiler.js';

describe('dbmlCompiler (Integration Tests)', () => {
  const genericDbml = `
Table customers {
  id integer [pk, increment]
  name varchar [not null]
  is_active boolean [not null, default: true]
  Note: 'Customer master data'
}

Table schema_meta {
  key varchar [pk]
  value text [not null]
}

Table orders {
  order_id integer [pk, increment]
  customer_id integer [not null]
  total_amount real [not null]
  is_cancelled boolean [default: false]
}

Ref: orders.customer_id > customers.id [delete: cascade]
`;

  test('compiles DBML to SQLite inlining foreign keys, AUTOINCREMENT, and boolean defaults', () => {
    const sqliteSql = compileDbmlToSqlite(genericDbml, { sourcePath: 'test_schema.dbml' });

    // Verifies SQLite PRAGMAs
    assert.ok(sqliteSql.includes('PRAGMA journal_mode = WAL;'));
    assert.ok(sqliteSql.includes('PRAGMA foreign_keys = ON;'));

    // Verifies no unsupported ALTER TABLE statements remain
    assert.strictEqual(
      sqliteSql.includes('ALTER TABLE'),
      false,
      'SQLite DDL must not contain ALTER TABLE statements for foreign keys'
    );

    // Verifies PostgreSQL COMMENT statements are removed
    assert.strictEqual(
      sqliteSql.includes('COMMENT ON'),
      false,
      'PostgreSQL COMMENT ON statements must be removed'
    );

    // Verifies foreign key was inlined inside orders table
    assert.ok(
      sqliteSql.includes('FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE CASCADE'),
      'Foreign key must be inlined into CREATE TABLE orders'
    );

    // Verifies autoincrement conversion on increment primary keys
    assert.ok(
      sqliteSql.includes('"id" INTEGER PRIMARY KEY AUTOINCREMENT'),
      'increment PK must become INTEGER PRIMARY KEY AUTOINCREMENT'
    );
    assert.ok(
      sqliteSql.includes('"order_id" INTEGER PRIMARY KEY AUTOINCREMENT'),
      'order_id PK must become INTEGER PRIMARY KEY AUTOINCREMENT'
    );

    // Verifies boolean normalization with and without NOT NULL
    assert.ok(
      sqliteSql.includes('"is_active" BOOLEAN NOT NULL DEFAULT 1'),
      'boolean [not null, default: true] must become BOOLEAN NOT NULL DEFAULT 1'
    );
    assert.ok(
      sqliteSql.includes('"is_cancelled" BOOLEAN DEFAULT 0'),
      'boolean [default: false] must become BOOLEAN DEFAULT 0'
    );

    // Verifies header references the source path
    assert.ok(sqliteSql.includes('-- Code automatically generated from test_schema.dbml'));
  });

  test('successfully executes compiled DDL in a live SQLite database and enforces foreign keys', () => {
    const sqliteSql = compileDbmlToSqlite(genericDbml, {
      sourcePath: 'test_schema.dbml',
      metadataTable: 'schema_meta',
      schemaVersion: '1'
    });

    const db = new Database(':memory:');

    // 1. DDL execution must succeed without syntax or dialect errors
    assert.doesNotThrow(() => {
      db.exec(sqliteSql);
    }, 'Compiled DDL must execute cleanly in SQLite');

    // 2. Tables must exist in sqlite_master
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(r => r.name);
    assert.deepStrictEqual(
      tables.sort(),
      ['customers', 'orders', 'schema_meta', 'sqlite_sequence'],
      'All tables including schema_meta and sqlite_sequence must exist'
    );

    // Verify metadata version was actually inserted
    const meta = db.prepare("SELECT value FROM schema_meta WHERE key = 'schema_version'").get();
    assert.strictEqual(meta?.value, '1', 'Metadata schema_version must be seeded in SQLite');

    // 3. Foreign key pragma introspection verifies constraint definition
    const fks = db.prepare('PRAGMA foreign_key_list(orders)').all();
    assert.strictEqual(fks.length, 1, 'orders must have exactly 1 foreign key');
    assert.strictEqual(fks[0].table, 'customers');
    assert.strictEqual(fks[0].from, 'customer_id');
    assert.strictEqual(fks[0].to, 'id');
    assert.strictEqual(fks[0].on_delete, 'CASCADE');

    // 4. Foreign key integrity enforcement in SQLite
    assert.throws(
      () => {
        db.prepare('INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)').run(999, 49.99);
      },
      /FOREIGN KEY constraint failed/,
      'Inserting referencing row with missing parent must throw FOREIGN KEY constraint failed'
    );

    // Inserting valid customer then order succeeds and default boolean values are applied
    const customerInsert = db.prepare('INSERT INTO customers (name) VALUES (?)').run('Alice');
    assert.strictEqual(Number(customerInsert.lastInsertRowid), 1, 'First inserted customer ID must be 1');

    const customerRow = db.prepare('SELECT * FROM customers WHERE id = 1').get();
    assert.strictEqual(customerRow.is_active, 1, 'Default is_active must be 1 in SQLite');

    const orderInsert = db.prepare('INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)').run(1, 49.99);
    assert.strictEqual(Number(orderInsert.lastInsertRowid), 1, 'First inserted order ID must be 1');

    const orderRow = db.prepare('SELECT * FROM orders WHERE order_id = 1').get();
    assert.strictEqual(orderRow.is_cancelled, 0, 'Default is_cancelled must be 0 in SQLite');

    // Cascading delete: deleting customer removes order
    db.prepare('DELETE FROM customers WHERE id = ?').run(1);
    const remainingOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    assert.strictEqual(remainingOrders.count, 0, 'Orders must cascade delete when customer is deleted');

    // Cleanup
    db.close();
  });
});
