import protobuf from 'protobufjs';

/**
 * Traverses a protobufjs namespace to find all services
 */
function findServicesInNamespace(namespace, services = []) {
  if (!namespace || !namespace.nested) return services;

  for (const [name, item] of Object.entries(namespace.nested)) {
    if (item.methods) {
      const comment = item.comment || '';
      const isJsonRpc = /@jsonrpc\b/.test(comment);

      const methods = Object.entries(item.methods).map(([methodName, methodObj]) => ({
        name: methodName,
        camelCaseName: methodName.charAt(0).toLowerCase() + methodName.slice(1),
        requestType: methodObj.requestType,
        responseType: methodObj.responseType,
        comment: methodObj.comment || ''
      }));

      services.push({
        name,
        comment,
        isJsonRpc,
        methods
      });
    } else if (item.nested) {
      findServicesInNamespace(item, services);
    }
  }

  return services;
}

/**
 * Parses protobuf text content and extracts service definitions
 *
 * @param {string} protoContent - Content of the .proto file
 * @param {string} [fileName] - Optional filename for source tracking
 * @returns {{ services: Array, package: string }}
 */
export function parseProtoContent(protoContent, fileName = '') {
  const parsed = protobuf.parse(protoContent, {
    keepCase: true,
    alternateCommentMode: true
  });

  const services = findServicesInNamespace(parsed.root);

  return {
    package: parsed.package || '',
    fileName,
    services
  };
}
