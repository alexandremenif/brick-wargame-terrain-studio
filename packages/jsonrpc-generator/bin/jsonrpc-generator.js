#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateJsonRpc } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

const defaultSpecPath = path.join(rootDir, 'specs/server/openrpc.yaml');
const defaultSchemaPaths = [
  path.join(rootDir, 'specs/domain/schemas/model.yaml'),
  path.join(rootDir, 'specs/domain/schemas/commands.yaml'),
];
const defaultTargetApiDir = path.join(rootDir, 'packages/api/src/generated');
const defaultTargetUiDir = path.join(rootDir, 'packages/ui/src/generated');
const defaultTargetServerDir = path.join(rootDir, 'packages/server/src/generated');

const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1];
  }
  return defaultValue;
}

const specPath = getArg('--spec', defaultSpecPath);
const targetApiDir = getArg('--target-api', defaultTargetApiDir);
const targetUiDir = getArg('--target-ui', defaultTargetUiDir);
const targetServerDir = getArg('--target-server', defaultTargetServerDir);
const serviceName = getArg('--service-name', undefined);
const clientName = getArg('--client-name', undefined);

try {
  await generateJsonRpc({
    specPath,
    schemaPaths: defaultSchemaPaths,
    targetApiDir,
    targetUiDir,
    targetServerDir,
    serviceName,
    clientName,
  });
} catch (err) {
  console.error('❌ Failed to generate JSON-RPC code:', err);
  process.exit(1);
}
