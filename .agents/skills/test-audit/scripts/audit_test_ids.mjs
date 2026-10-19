#!/usr/bin/env node

/**
 * audit_test_ids.mjs
 *
 * Deterministic Test ID Traceability & Coverage Auditor.
 * Cross-references acceptance test IDs declared in specs/ against implementations in test suites.
 */

import fs from 'node:fs';
import path from 'node:path';

// Resolve project root by searching upwards for `specs` directory
function resolveProjectRoot(startDir = process.cwd()) {
  let curr = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(curr, 'specs')) && fs.existsSync(path.join(curr, '.agents'))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) {
      break;
    }
    curr = parent;
  }
  return process.cwd();
}

const ROOT_DIR = resolveProjectRoot();
const SPECS_DIR = path.join(ROOT_DIR, 'specs');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');

// CLI Argument Parsing
function parseArgs(args) {
  const options = {
    scope: 'all',
    specFile: null,
    strict: false,
    format: 'text',
    showDetails: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg.startsWith('--scope=')) {
      options.scope = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--spec=')) {
      options.specFile = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1].toLowerCase();
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--details' || arg === '-v') {
      options.showDetails = true;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Test ID Traceability Auditor (audit_test_ids.mjs)

Usage:
  node .agents/skills/test-audit/scripts/audit_test_ids.mjs [options]

Options:
  --scope=<all|domain|server|ui>  Filter audit by architectural scope (default: all)
  --spec=<path>                   Filter audit by specific spec file (relative to root)
  --format=<text|markdown|json>   Output format (default: text)
  --strict                        Exit with non-zero code if any spec test ID is missing
  --details, -v                   Display matching test lines and descriptions
  --help, -h                      Show this help message
`);
}

function walkFiles(dir, predicate) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) {
        continue;
      }
      results.push(...walkFiles(fullPath, predicate));
    } else if (entry.isFile() && predicate(entry.name, fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

// 1. Extract declared test IDs from specs
function extractSpecIds(specFilter, scopeFilter) {
  const specFiles = walkFiles(SPECS_DIR, (name) => name.endsWith('.md'));
  const specIds = new Map();

  for (const file of specFiles) {
    const relPath = path.relative(ROOT_DIR, file);

    if (specFilter && !relPath.includes(specFilter)) {
      continue;
    }

    if (scopeFilter !== 'all') {
      const isScope =
        (scopeFilter === 'domain' && relPath.startsWith('specs/domain')) ||
        (scopeFilter === 'server' && relPath.startsWith('specs/server')) ||
        (scopeFilter === 'ui' && relPath.startsWith('specs/ui'));
      if (!isScope) continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = /^\s*[\*\-]?\s*[`"]?(TEST-[A-Z0-9]+(?:-[A-Z0-9]+)*)[`"]?:\s*(.*)$/.exec(line);
      if (match) {
        const id = match[1];
        const description = match[2].trim();

        if (!specIds.has(id)) {
          specIds.set(id, {
            id,
            description,
            occurrences: [],
          });
        }

        specIds.get(id).occurrences.push({
          file: relPath,
          line: i + 1,
        });
      }
    }
  }

  return specIds;
}

// 2. Extract implemented test IDs from packages/**/test/**/*.{ts,js}
function extractImplementedTestIds(scopeFilter) {
  const testFiles = [
    ...walkFiles(PACKAGES_DIR, (name, fullPath) => {
      const isTestDir = fullPath.includes('/test/') || fullPath.includes('/__tests__/');
      const isTestFile = /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(name);
      return isTestDir && isTestFile;
    }),
  ];

  const idPattern = /(TEST-[A-Z0-9]+(?:-[A-Z0-9]+)*)/g;
  const implementedIds = new Map();

  for (const file of testFiles) {
    const relPath = path.relative(ROOT_DIR, file);

    if (scopeFilter !== 'all') {
      const isScope =
        (scopeFilter === 'domain' && (relPath.includes('domain') || relPath.includes('TEST-DOMAIN'))) ||
        (scopeFilter === 'server' && (relPath.includes('server') || relPath.includes('TEST-SRV'))) ||
        (scopeFilter === 'ui' && (relPath.includes('ui') || relPath.includes('TEST-UI')));
      if (!isScope) continue;
    }

    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      while ((match = idPattern.exec(line)) !== null) {
        const id = match[1];
        // Ignore broad family headers like TEST-DOMAIN-BBOX without number
        if (!/-\d+$/.test(id)) {
          continue;
        }

        if (!implementedIds.has(id)) {
          implementedIds.set(id, []);
        }

        implementedIds.get(id).push({
          file: relPath,
          line: i + 1,
          snippet: line.trim(),
        });
      }
    }
  }

  return implementedIds;
}

function runAudit(options) {
  const specIds = extractSpecIds(options.specFile, options.scope);
  const implementedIds = extractImplementedTestIds(options.scope);

  const matched = [];
  const missing = [];
  const orphans = [];

  // Determine active prefixes if spec filter is applied
  const activePrefixes = new Set();
  if (options.specFile) {
    for (const id of specIds.keys()) {
      const prefixMatch = /^(TEST-[A-Z0-9]+-[A-Z0-9]+)/.exec(id);
      if (prefixMatch) {
        activePrefixes.add(prefixMatch[1]);
      }
    }
  }

  for (const [id, specMeta] of specIds.entries()) {
    if (implementedIds.has(id)) {
      matched.push({
        id,
        spec: specMeta,
        tests: implementedIds.get(id),
      });
    } else {
      missing.push({
        id,
        spec: specMeta,
      });
    }
  }

  for (const [id, tests] of implementedIds.entries()) {
    if (!specIds.has(id)) {
      if (options.specFile) {
        // Only report orphan if it belongs to the prefix targeted by this spec file
        const prefixMatch = /^(TEST-[A-Z0-9]+-[A-Z0-9]+)/.exec(id);
        if (prefixMatch && activePrefixes.has(prefixMatch[1])) {
          orphans.push({ id, tests });
        }
      } else {
        orphans.push({ id, tests });
      }
    }
  }

  return {
    scope: options.scope,
    specFile: options.specFile,
    stats: {
      totalSpecIds: specIds.size,
      matchedCount: matched.length,
      missingCount: missing.length,
      orphanCount: orphans.length,
      coveragePercent: specIds.size > 0 ? ((matched.length / specIds.size) * 100).toFixed(1) : '100.0',
    },
    matched,
    missing,
    orphans,
  };
}

function renderText(report, showDetails) {
  const { stats, matched, missing, orphans, scope, specFile } = report;
  const out = [];

  out.push('================================================================');
  out.push(`  Spec Test ID Traceability Report [Scope: ${scope.toUpperCase()}${specFile ? ` | Spec: ${specFile}` : ''}]`);
  out.push('================================================================');
  out.push(`Total Declared Spec IDs : ${stats.totalSpecIds}`);
  out.push(`Implemented & Matched   : ${stats.matchedCount} (${stats.coveragePercent}%)`);
  out.push(`Missing Implementations : ${stats.missingCount}`);
  out.push(`Orphan Tests (No Spec)  : ${stats.orphanCount}`);
  out.push('----------------------------------------------------------------');

  if (missing.length > 0) {
    out.push(`\n[!] MISSING SPEC TEST IDS (${missing.length}):`);
    for (const item of missing) {
      const src = item.spec.occurrences.map((o) => `${o.file}:${o.line}`).join(', ');
      out.push(`  - ${item.id} [${src}]`);
      out.push(`    "${item.spec.description}"`);
    }
  }

  if (orphans.length > 0) {
    out.push(`\n[?] ORPHAN TEST IDS IN SUITES (${orphans.length}):`);
    for (const item of orphans) {
      const src = item.tests.map((t) => `${t.file}:${t.line}`).join(', ');
      out.push(`  - ${item.id} -> ${src}`);
    }
  }

  if (matched.length > 0 && showDetails) {
    out.push(`\n[✓] MATCHED TEST IDS (${matched.length}):`);
    for (const item of matched) {
      const tests = item.tests.map((t) => `${t.file}:${t.line}`).join(', ');
      out.push(`  - ${item.id} -> ${tests}`);
    }
  }

  out.push('\n================================================================');
  return out.join('\n');
}

function renderMarkdown(report) {
  const { stats, matched, missing, orphans, scope, specFile } = report;
  const out = [];

  out.push(`### Spec Test ID Traceability Report (${scope.toUpperCase()}${specFile ? ` - ${specFile}` : ''})\n`);
  out.push('| Metric | Count |');
  out.push('| :--- | :--- |');
  out.push(`| **Declared Spec IDs** | ${stats.totalSpecIds} |`);
  out.push(`| **Matched in Tests** | ${stats.matchedCount} (${stats.coveragePercent}%) |`);
  out.push(`| **Missing Implementations** | ${stats.missingCount} |`);
  out.push(`| **Orphan Tests (No Spec)** | ${stats.orphanCount} |\n`);

  if (missing.length > 0) {
    out.push('#### Missing Test IDs');
    out.push('| ID | Spec File | Specification Criterion |');
    out.push('| :--- | :--- | :--- |');
    for (const item of missing) {
      const src = item.spec.occurrences.map((o) => `[${path.basename(o.file)}:${o.line}](${o.file}#L${o.line})`).join(', ');
      out.push(`| \`${item.id}\` | ${src} | ${item.spec.description.replace(/\|/g, '\\|')} |`);
    }
    out.push('');
  }

  if (orphans.length > 0) {
    out.push('#### Orphan Tests (Implemented without declared spec ID)');
    out.push('| ID | Test Location |');
    out.push('| :--- | :--- |');
    for (const item of orphans) {
      const src = item.tests.map((t) => `[${path.basename(t.file)}:${t.line}](${t.file}#L${t.line})`).join(', ');
      out.push(`| \`${item.id}\` | ${src} |`);
    }
    out.push('');
  }

  return out.join('\n');
}

// Main execution
const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const report = runAudit(options);

if (options.format === 'json') {
  console.log(JSON.stringify(report, null, 2));
} else if (options.format === 'markdown') {
  console.log(renderMarkdown(report));
} else {
  console.log(renderText(report, options.showDetails));
}

if (options.strict && report.stats.missingCount > 0) {
  process.exit(1);
}
