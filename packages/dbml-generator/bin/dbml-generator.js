#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileDbmlToSqlite } from '../src/dbmlCompiler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

const defaultDbmlPath = path.join(rootDir, 'specs/server/schema.dbml');
const defaultMigrationsDir = path.join(rootDir, 'packages/server/src/persistence/migrations');

const dbmlPath = process.argv[2] || defaultDbmlPath;
const migrationsDir = process.argv[3] || defaultMigrationsDir;

if (!fs.existsSync(dbmlPath)) {
  console.error(`DBML file not found at: ${dbmlPath}`);
  process.exit(1);
}

fs.mkdirSync(migrationsDir, { recursive: true });
const dbmlContent = fs.readFileSync(dbmlPath, 'utf-8');
const sql = compileDbmlToSqlite(dbmlContent, {
  migrationName: '0001_initial_schema',
  schemaVersion: 1
});

const outPath = path.join(migrationsDir, '0001_initial_schema.sql');
fs.writeFileSync(outPath, sql, 'utf-8');
console.log(`✓ SQLite migration compiled: ${outPath}`);
