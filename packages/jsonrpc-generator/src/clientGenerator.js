/**
 * Generate a generic typed JSON-RPC client class implementing the service interface over transport.
 *
 * @param {object} parsedSpec
 * @param {string} parsedSpec.serviceName
 * @param {string} parsedSpec.clientName
 * @param {Record<string, object>} parsedSpec.definitions
 * @param {Array<object>} parsedSpec.methods
 * @param {object} [options={}]
 * @param {string} [options.apiPackageName='@lego-wargame-terrain-studio/api']
 * @returns {string} TypeScript client source code
 */
export function generateClientClass(parsedSpec, options = {}) {
  const { serviceName, clientName, definitions, methods } = parsedSpec;
  const { apiPackageName = '@lego-wargame-terrain-studio/api' } = options;

  const exportedTypeNames = Object.keys(definitions).sort();
  const typeImports = [serviceName, ...exportedTypeNames]
    .map((name) => `  ${name},`)
    .join('\n');

  const clientMethods = methods.map((m) => {
    const paramsDecl = m.params.map((p) => `${p.name}: ${p.typeName}`).join(', ');
    const paramsPass = m.params.map((p) => p.name).join(', ');
    const resType = m.result.typeName;
    const desc = m.description ? `  /**\n   * ${m.description}\n   */\n` : '';

    return `${desc}  async ${m.name}(${paramsDecl}): Promise<${resType}> {
    return this.transport.call<${resType}>('${m.name}', ${paramsPass || 'undefined'});
  }`;
  }).join('\n\n');

  return `/* Generated from OpenRPC specifications. DO NOT EDIT. */
import type {
${typeImports}
} from '${apiPackageName}';

export interface JsonRpcTransport {
  call<T>(method: string, params?: unknown): Promise<T>;
  notify?(method: string, params?: unknown): void;
}

export class ${clientName} implements ${serviceName} {
  constructor(private transport: JsonRpcTransport) {}

${clientMethods}
}
`;
}
