import fs from 'node:fs';
import path from 'node:path';
import { parseOpenRpcSpec } from './schemaParser.js';
import { generateTypesAndService } from './typeGenerator.js';
import { generateClientClass } from './clientGenerator.js';
import { generateServerRouter } from './routerGenerator.js';

export {
  parseOpenRpcSpec,
  generateTypesAndService,
  generateClientClass,
  generateServerRouter,
};

/**
 * Orchestrate the complete JSON-RPC code generation pipeline.
 *
 * @param {object} options
 * @param {string} options.specPath - Path to OpenRPC YAML file
 * @param {string[]} [options.schemaPaths=[]] - Supplementary schema file paths
 * @param {string} [options.targetApiDir] - Output directory for DTO types and Service interface
 * @param {string} [options.targetUiDir] - Output directory for Client class
 * @param {string} [options.targetServerDir] - Output directory for Server router
 * @param {string} [options.serviceName] - Optional custom name for service interface
 * @param {string} [options.clientName] - Optional custom name for client class
 * @param {string} [options.apiPackageName='@lego-wargame-terrain-studio/api']
 * @param {object} [options.logger=console]
 */
export async function generateJsonRpc(options) {
  const {
    specPath,
    schemaPaths = [],
    targetApiDir,
    targetUiDir,
    targetServerDir,
    serviceName,
    clientName,
    apiPackageName = '@lego-wargame-terrain-studio/api',
    logger = console,
  } = options;

  logger.log(`⚡ Parsing and dereferencing OpenRPC spec: ${specPath}...`);
  const parsedSpec = await parseOpenRpcSpec({
    specPath,
    schemaPaths,
    serviceName,
    clientName,
  });

  logger.log(`✓ Parsed service "${parsedSpec.serviceName}" with ${parsedSpec.methods.length} methods and ${Object.keys(parsedSpec.definitions).length} definitions.`);

  // 1. Generate types & service interface (API)
  if (targetApiDir) {
    fs.mkdirSync(targetApiDir, { recursive: true });
    logger.log(`⚡ Generating TypeScript DTO types and ${parsedSpec.serviceName} interface in ${targetApiDir}...`);
    const { typesCode, serviceCode } = await generateTypesAndService(parsedSpec);

    fs.writeFileSync(path.join(targetApiDir, 'types.ts'), typesCode, 'utf-8');
    fs.writeFileSync(path.join(targetApiDir, 'service.ts'), serviceCode, 'utf-8');
    logger.log(`✓ Generated ${path.join(targetApiDir, 'types.ts')}`);
    logger.log(`✓ Generated ${path.join(targetApiDir, 'service.ts')}`);
  }

  // 2. Generate Client class (UI)
  if (targetUiDir) {
    fs.mkdirSync(targetUiDir, { recursive: true });
    logger.log(`⚡ Generating ${parsedSpec.clientName} class in ${targetUiDir}...`);
    const clientCode = generateClientClass(parsedSpec, { apiPackageName });

    fs.writeFileSync(path.join(targetUiDir, 'client.ts'), clientCode, 'utf-8');
    logger.log(`✓ Generated ${path.join(targetUiDir, 'client.ts')}`);
  }

  // 3. Generate Server Router (Server)
  if (targetServerDir) {
    fs.mkdirSync(targetServerDir, { recursive: true });
    logger.log(`⚡ Generating server router in ${targetServerDir}...`);
    const routerCode = generateServerRouter(parsedSpec, { apiPackageName });

    fs.writeFileSync(path.join(targetServerDir, 'router.ts'), routerCode, 'utf-8');
    fs.writeFileSync(path.join(targetServerDir, 'openrpc.json'), JSON.stringify(parsedSpec.openRpcDoc, null, 2), 'utf-8');
    logger.log(`✓ Generated ${path.join(targetServerDir, 'router.ts')}`);
    logger.log(`✓ Generated ${path.join(targetServerDir, 'openrpc.json')}`);
  }

  logger.log('🎉 JSON-RPC code generation completed successfully.');
}
