import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import RefParser from '@apidevtools/json-schema-ref-parser';

/**
 * Converts a string to PascalCase (e.g. "my-service" -> "MyService")
 * @param {string} str
 * @returns {string}
 */
export function toPascalCase(str) {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Parse an OpenRPC specification and optional supplementary schema files into normalized definitions and methods.
 * Completely generic and domain-agnostic.
 *
 * @param {object} options
 * @param {string} options.specPath - Path to the OpenRPC YAML file
 * @param {string[]} [options.schemaPaths=[]] - Optional list of additional YAML schema files
 * @param {string} [options.serviceName] - Optional custom name for the service interface
 * @param {string} [options.clientName] - Optional custom name for the client class
 * @returns {Promise<{
 *   serviceName: string,
 *   clientName: string,
 *   openRpcDoc: object,
 *   definitions: Record<string, object>,
 *   methods: Array<{
 *     name: string,
 *     description?: string,
 *     params: Array<{ name: string, typeName: string, schema: object }>,
 *     result: { name: string, typeName: string, schema: object }
 *   }>
 * }>}
 */
export async function parseOpenRpcSpec(options) {
  const { specPath, schemaPaths = [], serviceName, clientName } = options;

  if (!fs.existsSync(specPath)) {
    throw new Error(`OpenRPC specification file not found: ${specPath}`);
  }

  // 1. Dereference OpenRPC specification internally
  const openRpcDoc = await RefParser.dereference(specPath);

  // 2. Derive service & client names generically from info.title if not explicitly provided
  const rawTitle = openRpcDoc.info?.title || 'OpenRpc';
  const baseName = toPascalCase(rawTitle);
  const resolvedServiceName = serviceName || `${baseName}Service`;
  const resolvedClientName = clientName || `${baseName}Client`;

  // 3. Extract and merge all definitions from supplementary schemas
  const definitions = {};

  for (const sPath of schemaPaths) {
    if (fs.existsSync(sPath)) {
      const content = fs.readFileSync(sPath, 'utf-8');
      // Replace intra-file cross references with internal #/definitions/
      const normalizedContent = content.replace(/([a-zA-Z0-9_\-.]+\.yaml)#\/definitions\//g, '#/definitions/');
      const parsed = yaml.parse(normalizedContent);
      if (parsed && typeof parsed === 'object' && parsed.definitions) {
        Object.assign(definitions, parsed.definitions);
      }
    }
  }

  // 4. Extract method signatures and collect any schema definitions declared on methods
  const methods = [];
  if (Array.isArray(openRpcDoc.methods)) {
    for (const m of openRpcDoc.methods) {
      const parsedParams = [];
      if (Array.isArray(m.params)) {
        for (const p of m.params) {
          const typeName = p.schema?.title || toPascalCase(p.name);
          if (p.schema && p.schema.title && !definitions[p.schema.title]) {
            definitions[p.schema.title] = p.schema;
          }
          parsedParams.push({
            name: p.name,
            typeName,
            schema: p.schema,
          });
        }
      }

      let parsedResult = { name: 'result', typeName: 'void', schema: null };
      if (m.result && m.result.schema) {
        const typeName = m.result.schema.title || `${toPascalCase(m.name)}Response`;
        if (m.result.schema.title && !definitions[m.result.schema.title]) {
          definitions[m.result.schema.title] = m.result.schema;
        }
        parsedResult = {
          name: m.result.name || 'result',
          typeName,
          schema: m.result.schema,
        };
      }

      methods.push({
        name: m.name,
        description: m.description,
        params: parsedParams,
        result: parsedResult,
      });
    }
  }

  return {
    serviceName: resolvedServiceName,
    clientName: resolvedClientName,
    openRpcDoc,
    definitions,
    methods,
  };
}
