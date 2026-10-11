/**
 * Generate a generic server router and dispatcher for @open-rpc/server-js.
 *
 * @param {object} parsedSpec
 * @param {string} parsedSpec.serviceName
 * @param {Record<string, object>} parsedSpec.definitions
 * @param {Array<object>} parsedSpec.methods
 * @param {object} parsedSpec.openRpcDoc
 * @param {object} [options={}]
 * @param {string} [options.apiPackageName='@lego-wargame-terrain-studio/api']
 * @returns {string} TypeScript server router source code
 */
export function generateServerRouter(parsedSpec, options = {}) {
  const { serviceName, definitions, methods, openRpcDoc } = parsedSpec;
  const { apiPackageName = '@lego-wargame-terrain-studio/api' } = options;

  const exportedTypeNames = Object.keys(definitions).sort();
  const typeImports = [serviceName, ...exportedTypeNames]
    .map((name) => `  ${name},`)
    .join('\n');

  const routerMappings = methods.map((m) => {
    const paramArg = m.params[0] ? `${m.params[0].name}: ${m.params[0].typeName}` : '';
    const passArg = m.params[0] ? m.params[0].name : '';

    return `    ${m.name}: async (${paramArg}) => {
      try {
        return await service.${m.name}(${passArg});
      } catch (err: any) {
        if (err && typeof err.code === 'number' && typeof err.message === 'string') {
          throw new JSONRPCError(err.message, err.code, err.data);
        }
        throw new JSONRPCError(err?.message || '${m.name} failed', -32000, err);
      }
    },`;
  }).join('\n');

  return `/* Generated from OpenRPC specifications. DO NOT EDIT. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router, JSONRPCError } from '@open-rpc/server-js';
import type {
${typeImports}
} from '${apiPackageName}';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openRpcDocPath = path.resolve(__dirname, 'openrpc.json');
let cachedOpenRpcDoc: any = null;

function getOpenRpcDocument(): any {
  if (!cachedOpenRpcDoc) {
    cachedOpenRpcDoc = JSON.parse(fs.readFileSync(openRpcDocPath, 'utf-8'));
  }
  return cachedOpenRpcDoc;
}

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id?: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export function createRpcRouter(service: ${serviceName}): Router {
  const methodMapping = {
${routerMappings}
  };

  return new Router(getOpenRpcDocument(), methodMapping);
}

export async function dispatchJsonRpc(
  service: ${serviceName},
  request: JsonRpcRequest
): Promise<JsonRpcResponse> {
  const router = createRpcRouter(service);
  const { id = null, method, params } = request;
  const res = await router.call(method, params);
  return {
    jsonrpc: '2.0',
    id,
    ...res,
  };
}
`;
}
