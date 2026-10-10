import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { parseProtoContent } from './protoParser.js';
import { generateDispatcherForService } from './dispatcherGenerator.js';
import { compileDbmlToSqlite } from './dbmlCompiler.js';

import { fileURLToPath } from 'node:url';

/**
 * Recursively find files matching an extension within a directory
 */
export function findFilesRecursively(dir, extension, fsModule = fs) {
  let results = [];
  if (!fsModule.existsSync(dir)) return results;
  const entries = fsModule.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findFilesRecursively(fullPath, extension, fsModule));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Locates an executable binary across node_modules/.bin directories, searching upwards
 */
export function resolveBinary(name, searchDirs = []) {
  const dirsToSearch = [
    ...searchDirs,
    process.cwd(),
    path.dirname(fileURLToPath(import.meta.url))
  ];

  for (const dir of dirsToSearch) {
    if (!dir) continue;
    let curr = path.resolve(dir);
    while (true) {
      const binPath = path.join(curr, 'node_modules', '.bin', name);
      if (fs.existsSync(binPath)) {
        return binPath;
      }
      const parent = path.dirname(curr);
      if (parent === curr) break;
      curr = parent;
    }
  }

  return name;
}

/**
 * Executes the full code generation pipeline
 *
 * @param {object} options
 * @param {string} options.specsDir - Root directory containing specification files
 * @param {string} options.targetDomainDir - Output directory for compiled TypeScript DTOs
 * @param {string} options.targetMigrationsDir - Output directory for SQLite migrations
 * @param {string} [options.rootDir] - Monorepo root directory for binary discovery
 * @param {string} [options.metadataTable] - Optional metadata table for schema version tracking
 * @param {string} [options.schemaVersion='1'] - Schema version to insert
 * @param {string[]} [options.rpcServices] - Whitelist of service names to expose via JSON-RPC
 * @param {Function} [options.exec] - Optional custom command executor
 * @param {object} [options.logger=console] - Custom logger
 */
export async function runCodegen(options) {
  const {
    specsDir,
    targetDomainDir,
    targetMigrationsDir,
    rootDir = process.cwd(),
    metadataTable,
    schemaVersion = '1',
    rpcServices,
    exec = execSync,
    logger = console
  } = options;

  logger.log('🚀 Starting code generation pipeline (Spec-Driven Development)...');

  // ==========================================================================
  // 1. Protobuf compilation -> TypeScript DTOs & JSON-RPC Dispatcher
  // ==========================================================================
  const protoFiles = findFilesRecursively(specsDir, '.proto');

  if (protoFiles.length > 0) {
    logger.log(`📦 [1/2] Protobuf compilation (${protoFiles.length} files found in specs/) -> TypeScript...`);
    fs.mkdirSync(targetDomainDir, { recursive: true });

    const searchDirs = [rootDir, path.resolve(rootDir, '..'), process.cwd()];
    const grpcToolsProtoc = resolveBinary('grpc_tools_node_protoc', searchDirs);
    const tsProtoPlugin = resolveBinary('protoc-gen-ts_proto', searchDirs);

    const protoIncludeDirs = [...new Set(protoFiles.map(f => path.dirname(f)))];
    const protoPathArgs = protoIncludeDirs.map(d => `--proto_path="${d}"`).join(' ');

    const cmd = `"${grpcToolsProtoc}" \
      --plugin=protoc-gen-ts_proto="${tsProtoPlugin}" \
      --ts_proto_out="${targetDomainDir}" \
      --ts_proto_opt=outputServices=generic-definitions,outputServices=default,env=node,esModuleInterop=true,importSuffix=.js \
      ${protoPathArgs} \
      ${protoFiles.map(f => `"${f}"`).join(' ')}`;

    exec(cmd, { stdio: 'inherit' });

    // Inspect proto files to find services annotated with @jsonrpc (or whitelisted)
    for (const protoFile of protoFiles) {
      const content = fs.readFileSync(protoFile, 'utf-8');
      const { services } = parseProtoContent(content, path.basename(protoFile));

      for (const service of services) {
        const shouldExpose = rpcServices
          ? rpcServices.includes(service.name)
          : service.isJsonRpc;

        if (shouldExpose) {
          logger.log(`⚡ Generating JSON-RPC dispatcher for service: ${service.name}`);
          const protoBaseName = path.basename(protoFile, '.proto');
          const dispatcherCode = generateDispatcherForService(service, {
            importFrom: `./${protoBaseName}.js`
          });
          const dispatcherPath = path.join(targetDomainDir, 'jsonRpcDispatcher.ts');
          fs.writeFileSync(dispatcherPath, dispatcherCode, 'utf-8');
        }
      }
    }

    logger.log(`✅ Types and contracts generated in: ${targetDomainDir}`);
  }

  // ==========================================================================
  // 2. DBML compilation -> SQLite Migration
  // ==========================================================================
  const dbmlFiles = findFilesRecursively(specsDir, '.dbml');

  if (dbmlFiles.length > 0) {
    const dbmlPath = dbmlFiles[0];
    logger.log(`💾 [2/2] DBML compilation (${path.relative(rootDir, dbmlPath)}) -> SQLite Migration...`);
    fs.mkdirSync(targetMigrationsDir, { recursive: true });
    const migrationFile = path.join(targetMigrationsDir, '0001_initial_schema.sql');

    try {
      const dbmlContent = fs.readFileSync(dbmlPath, 'utf-8');
      const sqliteSql = compileDbmlToSqlite(dbmlContent, {
        metadataTable,
        schemaVersion,
        sourcePath: path.relative(rootDir, dbmlPath)
      });

      fs.writeFileSync(migrationFile, sqliteSql, 'utf-8');
      logger.log(`✅ SQL migration generated in: ${migrationFile}`);
    } catch (err) {
      logger.error('❌ Error during SQL generation from DBML:', err.message);
      throw err;
    }
  }

  logger.log('🎉 Code generation pipeline completed successfully!');
}
