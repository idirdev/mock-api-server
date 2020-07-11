'use strict';

/**
 * @file tests/index.test.js
 * @description Tests for @idirdev/mock-api-server.
 * @author idirdev
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http   = require('node:http');
const {
  createServer, createRouter, matchRoute,
  extractParams, parseQueryString, addRoute, removeRoute,
} = require('../src/index.js');

/**
 * Makes a simple HTTP request and resolves with { status, headers, body }.
 * @param {object} opts - Options passed to http.request.
 * @returns {Promise<{status:number, headers:object, body:string}>}
 */
function request(opts) {
  return new Promise(function requestPromise(resolve, reject) {
    const req = http.request(opts, function onResponse(res) {
      let body = '';
      res.on('data', function onData(chunk) { body += chunk; });
      res.on('end',  function onEnd()  { resolve({ status: res.statusCode, headers: res.headers, body }); });
    });
    req.on('error', reject);
    req.end();
  });
}

let server;
let port;

before(async function startServer() {
  server = createServer({
    cors: true,
    routes: [
      { method: 'GET',    path: '/ping',     status: 200, body: { ok: true } },
      { method: 'GET',    path: '/users',    status: 200, body: [{ id: 1, name: 'Alice' }] },
      { method: 'GET',    path: '/users/:id',status: 200, body: { id: 1 } },
      { method: 'POST',   path: '/users',    status: 201, body: { created: true } },
      { method: 'DELETE', path: '/users/:id',status: 204, body: '' },
      { method: 'GET',    path: '/slow',     status: 200, body: { slow: true }, delay: 60 },
    ],
  });
  await new Promise(function listenPromise(resolve) {
    server.listen(0, '127.0.0.1', function onListen() {
      port = server.address().port;
      resolve();
    });
  });
});

after(async function stopServer() {
  await new Promise(function closePromise(resolve) { server.close(resolve); });
});

describe('unit helpers', function unitHelpers() {
  test('parseQueryString extracts key-value pairs', function () {
    const q = parseQueryString('/users?page=2&limit=5');
    assert.equal(q.page, '2');
    assert.equal(q.limit, '5');
  });

  test('extractParams extracts named params', function () {
    const p = extractParams('/users/:id', '/users/42');
    assert.equal(p.id, '42');
  });

  test('matchRoute returns null for unknown path', function () {
    const routes = [{ method: 'GET', path: '/foo' }];
    assert.equal(matchRoute(routes, 'GET', '/bar'), null);
  });

  test('addRoute replaces existing same-method/path route', function () {
    const routes = [{ method: 'GET', path: '/x', status: 200 }];
    addRoute(routes, { method: 'GET', path: '/x', status: 404 });
    assert.equal(routes.length, 1);
    assert.equal(routes[0].status, 404);
  });

  test('removeRoute removes matching route', function () {
    const routes = [{ method: 'GET', path: '/x', status: 200 }];
    const removed = removeRoute(routes, 'GET', '/x');
    assert.equal(removed, true);
    assert.equal(routes.length, 0);
  });
});

describe('HTTP integration', function httpIntegration() {
  test('GET /ping returns 200 with JSON body', async function () {
    const res = await request({ hostname: '127.0.0.1', port, path: '/ping', method: 'GET' });
    assert.equal(res.status, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.ok, true);
  });

  test('GET /users returns array', async function () {
    const res = await request({ hostname: '127.0.0.1', port, path: '/users', method: 'GET' });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(JSON.parse(res.body)));
  });

  test('GET /users/:id responds 200', async function () {
    const res = await request({ hostname: '127.0.0.1', port, path: '/users/99', method: 'GET' });
    assert.equal(res.status, 200);
  });

  test('POST /users returns 201', async function () {
    const res = await request({ hostname: '127.0.0.1', port, path: '/users', method: 'POST' });
    assert.equal(res.status, 201);
  });

  test('GET unknown route returns 404', async function () {
    const res = await request({ hostname: '127.0.0.1', port, path: '/notfound', method: 'GET' });
    assert.equal(res.status, 404);
  });

  test('CORS header present on GET response', async function () {
    const res = await request({ hostname: '127.0.0.1', port, path: '/ping', method: 'GET' });
    assert.ok(res.headers['access-control-allow-origin']);
  });

  test('delayed route responds after expected time', async function () {
    const start = Date.now();
    const res   = await request({ hostname: '127.0.0.1', port, path: '/slow', method: 'GET' });
    const elapsed = Date.now() - start;
    assert.equal(res.status, 200);
    assert.ok(elapsed >= 40, 'expected at least 40 ms delay, got ' + elapsed + ' ms');
  });

  test('query string does not break routing', async function () {
    const res = await request({ hostname: '127.0.0.1', port, path: '/users?page=1', method: 'GET' });
    assert.equal(res.status, 200);
  });
});
