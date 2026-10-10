import { exporter } from '@dbml/core';
import { normalizePostgresSqlToSqlite } from './sqlNormalizer.js';

export { normalizePostgresSqlToSqlite };

/**
 * Compiles DBML text directly into a SQLite migration script
 *
 * @param {string} dbmlContent - DBML markup string
 * @param {object} [options] - Options passed to normalizer
 * @returns {string} Ready-to-execute SQLite migration script
 */
export function compileDbmlToSqlite(dbmlContent, options = {}) {
  const rawPostgresSql = exporter.export(dbmlContent, 'postgres');
  return normalizePostgresSqlToSqlite(rawPostgresSql, options);
}
