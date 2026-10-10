# Reference: Maintaining specs/04_json_rpc_and_mcp/

## Purpose
The `specs/04_json_rpc_and_mcp/` directory defines the JSON-RPC communication facade and the Model Context Protocol (MCP) tool inventory.

## Structure
* `index.md`: JSON-RPC methods matching `TerrainEngineService` (declared in `specs/01_domain/services.proto`) and AI tools exposed via MCP.

## Golden Rules
* Any new remote method or AI capability must first be declared in domain contracts, compiled with `npm run codegen`, and then documented here.
