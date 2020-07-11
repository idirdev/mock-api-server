#!/usr/bin/env node
'use strict';

/**
 * @file bin/cli.js
 * @description CLI entry point for @idirdev/mock-api-server.
 * @author idirdev
 * @example
 *   mock-api-server --config routes.json --port 3000 --cors --delay 100
 */

const fs   = require('node:fs');
const path = require('node:path');
const { createServer } = require('../src/index.js');

const args = process.argv.slice(2);

/**
 * Returns the value following a named flag, or null.
 * @param {string[]} argv
 * @param {string}   name
 * @returns {string|null}
 */
function getArg(argv, name) {
  const idx = argv.indexOf('--' + name);
  if (idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) return argv[idx + 1];
  return null;
}

/**
 * Returns true if a boolean flag is present.
 * @param {string[]} argv
 * @param {string}   name
 * @returns {boolean}
 */
function hasFlag(argv, name) {
  return argv.includes('--' + name);
}

if (hasFlag(args, 'help') || hasFlag(args, 'h')) {
  console.log([
    'Usage: mock-api-server [options]',
    '',
    'Options:',
    '  --config <file>   Path to JSON routes config file (array of route objects)',
    '  --port   <n>      Port to listen on (default: 3000)',
    '  --cors            Enable CORS headers',
    '  --delay  <ms>     Global response delay in ms (default: 0)',
    '  --help            Show this help message',
    '',
    'Route object: { method, path, status, body, headers, delay }',
  ].join('
'));
  process.exit(0);
}

const configFile = getArg(args, 'config');
const port       = parseInt(getArg(args, 'port')  || '3000', 10);
const cors       = hasFlag(args, 'cors');
const delay      = parseInt(getArg(args, 'delay') || '0',    10);

let routes = [];

if (configFile) {
  const configPath = path.resolve(process.cwd(), configFile);
  if (!fs.existsSync(configPath)) {
    console.error('Error: config file not found:', configPath);
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    routes = JSON.parse(raw);
    if (!Array.isArray(routes)) {
      console.error('Error: config file must contain a JSON array of route objects');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error parsing config file:', err.message);
    process.exit(1);
  }
}

const server = createServer({ routes, cors, delay });
server.listen(port, function onListen() {
  console.log('mock-api-server listening on http://localhost:' + port);
  if (cors)  console.log('  CORS: enabled');
  if (delay) console.log('  Global delay: ' + delay + ' ms');
  console.log('  Routes: ' + routes.length);
});
