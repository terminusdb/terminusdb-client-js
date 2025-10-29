#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Post-process generated .d.ts files to fix the 'eval' export issue.
 * The function 'eval' is a reserved keyword in strict mode, so we rename it
 * in the type definitions while keeping the JavaScript implementation for backward compatibility.
 */

const fs = require('fs');
const path = require('path');

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

if (content.length < originalLength) {
  fs.writeFileSync(woqlDtsPath, content, 'utf8');
  console.log('>> Removed eval export from woql.d.ts (use evaluate() instead)');
} else {
  console.log('>> No eval export found in woql.d.ts, no workaround needed');
}
