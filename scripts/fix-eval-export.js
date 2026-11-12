#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Post-process generated .d.ts files to fix the 'eval' export issue.
 * The function 'eval' is a reserved keyword in strict mode, so we rename it
 * in the type definitions while keeping the JavaScript implementation for backward compatibility.
 */

const fs = require('node:fs');
const path = require('node:path');

const woqlDtsPath = path.join(__dirname, '../dist/typescript/lib/woql.d.ts');

if (!fs.existsSync(woqlDtsPath)) {
  console.error(`Error: ${woqlDtsPath} not found. Run 'npm run generate-types' first.`);
  process.exit(1);
}

let content = fs.readFileSync(woqlDtsPath, 'utf8');

// Remove the eval export line (it's deprecated, use evaluate instead)
const evalExportRegex = /export declare function eval\([^)]*\): [^;]+;[\r\n]*/g;
const originalLength = content.length;

content = content.replace(evalExportRegex, '');

// Fix circular import aliases for gt/lt (TypeScript generates invalid syntax)
// Replace: import gt = greater;
// With:    export declare const gt: typeof greater;
const gtAliasRegex = /^import gt = greater;$/gm;
const ltAliasRegex = /^import lt = less;$/gm;

content = content.replace(gtAliasRegex, 'export declare const gt: typeof greater;');
content = content.replace(ltAliasRegex, 'export declare const lt: typeof less;');

// Remove gt and lt from the final export statement to avoid duplicate exports
content = content.replace(/export\s*{\s*gt,\s*lt,\s*(_true\s+as\s+true)\s*};/, 'export { $1 };');

if (content.length < originalLength) {
  fs.writeFileSync(woqlDtsPath, content, 'utf8');
  console.log('>> Removed eval export from woql.d.ts (use evaluate() instead)');
  console.log('>> Fixed gt/lt import aliases');
} else {
  fs.writeFileSync(woqlDtsPath, content, 'utf8');
  console.log('>> No eval export found in woql.d.ts, but fixed gt/lt aliases');
}

// Re-export the typedef module's types from the package root so consumers can
// write: import TerminusClient, { WOQLResult } from 'terminusdb'
// typedef.d.ts contains only `export type` declarations, so a plain `export *`
// re-exports types only; `export type *` is not valid TypeScript syntax.
const indexDtsPath = path.join(__dirname, '../dist/typescript/index.d.ts');

if (fs.existsSync(indexDtsPath)) {
  const reExport = 'export * from "./lib/typedef";';
  const indexContent = fs.readFileSync(indexDtsPath, 'utf8');
  if (!indexContent.includes(reExport)) {
    fs.writeFileSync(indexDtsPath, `${indexContent.trimEnd()}\n${reExport}\n`);
    console.log('>> Added typedef type re-exports to index.d.ts');
  }
}
