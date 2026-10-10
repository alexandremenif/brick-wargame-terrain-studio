---
trigger: glob
globs: "*.db, *.sqlite, *.db-wal, *.db-shm, **/data/**"
description: "Strict prohibition against direct textual or unauthorized editing of SQLite database files"
---

# SQLite Database Protection Rules

1. **Strict Binary Format**:
   * Files ending in `.db`, `.sqlite`, `.db-wal`, or `.db-shm` are binary relational databases.
   * It is STRICTLY FORBIDDEN to use text-editing tools (`replace_file_content`, `write_to_file`) or arbitrary shell scripts directly on these database files.

2. **Authorized Access Only**:
   * Any read, write, or mutation of terrain database data must occur exclusively through:
     * Tools exposed by the Model Context Protocol (MCP) server.
     * The Web Studio user interface.
