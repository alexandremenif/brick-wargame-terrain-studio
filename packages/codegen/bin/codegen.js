#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCodegen } from '../src/pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Monorepo root is 2 levels up from packages/codegen/bin
const rootDir = path.resolve(__dirname, '../../..');

const options = {
  rootDir,
  specsDir: path.join(rootDir, 'specs'),
  targetDomainDir: path.join(rootDir, 'packages', 'core-engine', 'src', 'generated', 'domain'),
  targetMigrationsDir: path.join(rootDir, 'packages', 'core-engine', 'src', 'generated', 'migrations'),
  metadataTable: 'project_metadata',
  schemaVersion: '1'
};

runCodegen(options).catch(err => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
