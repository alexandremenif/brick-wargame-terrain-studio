import { compile } from 'json-schema-to-typescript';

/**
 * Generate TypeScript DTO interfaces and Service interface.
 * Uses json-schema-to-typescript to guarantee pristine primitive types (number, string, boolean).
 *
 * @param {object} parsedSpec
 * @param {string} parsedSpec.serviceName
 * @param {Record<string, object>} parsedSpec.definitions
 * @param {Array<object>} parsedSpec.methods
 * @returns {Promise<{ typesCode: string, serviceCode: string }>}
 */
export async function generateTypesAndService(parsedSpec) {
  const { serviceName, definitions, methods } = parsedSpec;

  // 1. Compile schema definitions to clean TypeScript types
  const rootSchema = { definitions };
  let rawTypes = await compile(rootSchema, 'RootDefinitions', {
    bannerComment: '/* Generated from OpenRPC specifications. DO NOT EDIT. */',
    unreachableDefinitions: true,
  });

  // Strip artificial root container interface emitted by json-schema-to-typescript
  rawTypes = rawTypes.replace(/export interface RootDefinitions \{\s*\[k: string\]: unknown;\s*\}\s*/g, '').trim();

  // 2. Generate the typed service contract
  const methodSignatures = methods.map((m) => {
    const params = m.params.map((p) => `${p.name}: ${p.typeName}`).join(', ');
    const desc = m.description ? `  /**\n   * ${m.description}\n   */\n` : '';
    return `${desc}  ${m.name}(${params}): Promise<${m.result.typeName}>;`;
  }).join('\n\n');

  const exportedTypeNames = Object.keys(definitions).sort();
  const importBlock = exportedTypeNames.length > 0
    ? `import type {\n${exportedTypeNames.map((name) => `  ${name},`).join('\n')}\n} from './types.js';\n\n`
    : '';

  const serviceCode = `/* Generated from OpenRPC specifications. DO NOT EDIT. */
${importBlock}export interface ${serviceName} {
${methodSignatures}
}
`;

  return {
    typesCode: `${rawTypes}\n`,
    serviceCode,
  };
}
