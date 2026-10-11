import { StudioWorld } from './world.js';
import { JsonRpcDriver } from './jsonrpc_driver.js';
import { McpDriver } from './mcp_driver.js';

// Automatically register server-side transport drivers
StudioWorld.registerDriver('jsonrpc', () => new JsonRpcDriver());
StudioWorld.registerDriver('mcp', () => new McpDriver());
