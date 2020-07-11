'use strict';

/**
 * @module mock-api-server
 * @description Create mock REST API servers from a JSON route configuration.
 * @author idirdev
 */

const http = require('node:http');
const url  = require('node:url');

/**
 * Parses a query string from a URL string.
 * @param {string} rawUrl - Full URL string, e.g. "/users?page=1&limit=10".
 * @returns {Object.<string,string>} Parsed key-value pairs.
 */
function parseQueryString(rawUrl) {
  const parsed = url.parse(rawUrl, true);
  return parsed.query || {};
}

/**
 * Extracts the pathname portion of a URL, stripping the query string.
 * @param {string} rawUrl - Raw URL string.
 * @returns {string} Pathname without query string.
 */
function getPathname(rawUrl) {
  return url.parse(rawUrl).pathname || rawUrl;
}

/**
 * Tests whether a URL path matches a route pattern with named params (:id).
 * @param {string} pattern  - Route pattern, e.g. "/users/:id".
 * @param {string} pathname - Actual URL path, e.g. "/users/42".
 * @returns {boolean}
 */
function pathMatches(pattern, pathname) {
  const patParts = pattern.split('/').filter(Boolean);
  const urlParts = pathname.split('/').filter(Boolean);
  if (patParts.length !== urlParts.length) return false;
  return patParts.every((seg, i) => seg.startsWith(':') || seg === urlParts[i]);
}

/**
 * Extracts named path parameters from a URL path given a pattern.
 * @param {string} pattern  - Route pattern, e.g. "/users/:id".
 * @param {string} pathname - Actual URL path, e.g. "/users/42".
 * @returns {Object.<string,string>} Map of param names to values.
 */
function extractParams(pattern, pathname) {
  const patParts = pattern.split('/').filter(Boolean);
  const urlParts = pathname.split('/').filter(Boolean);
  const params   = {};
  patParts.forEach((seg, i) => {
    if (seg.startsWith(':')) params[seg.slice(1)] = urlParts[i];
  });
  return params;
}

/**
 * Finds the first route matching the given HTTP method and URL.
 * @param {Array<object>} routes - Registered routes.
 * @param {string}        method - HTTP method, e.g. "GET".
 * @param {string}        rawUrl - Raw request URL.
 * @returns {{ route: object, params: object }|null} Match result or null.
 */
function matchRoute(routes, method, rawUrl) {
  const pathname = getPathname(rawUrl);
  for (const route of routes) {
    if (route.method.toUpperCase() !== method.toUpperCase()) continue;
    if (pathMatches(route.path, pathname)) {
      return { route, params: extractParams(route.path, pathname) };
    }
  }
  return null;
}

/**
 * Adds or replaces a route in the routes array (matched by method + path).
 * @param {Array<object>} routes - Route list to mutate.
 * @param {object}        route  - Route definition to add.
 */
function addRoute(routes, route) {
  const idx = routes.findIndex(
    (r) => r.method.toUpperCase() === route.method.toUpperCase() && r.path === route.path
  );
  if (idx !== -1) routes.splice(idx, 1, route);
  else routes.push(route);
}

/**
 * Removes a route from the routes array by method and path.
 * @param {Array<object>} routes    - Route list to mutate.
 * @param {string}        method    - HTTP method.
 * @param {string}        routePath - Route path pattern.
 * @returns {boolean} True if a route was removed.
 */
function removeRoute(routes, method, routePath) {
  const idx = routes.findIndex(
    (r) => r.method.toUpperCase() === method.toUpperCase() && r.path === routePath
  );
  if (idx !== -1) { routes.splice(idx, 1); return true; }
  return false;
}

/**
 * Sends the HTTP response for a matched route.
 * @param {object}  route  - Matched route definition.
 * @param {object}  req    - Node.js IncomingMessage.
 * @param {object}  res    - Node.js ServerResponse.
 * @param {object}  params - Extracted path params.
 * @param {object}  query  - Parsed query string.
 * @param {boolean} cors   - Whether to add CORS headers.
 */
function handleRequest(route, req, res, params, query, cors) {
  const status  = route.status  !== undefined ? route.status : 200;
  const body    = route.body    !== undefined ? route.body   : null;
  const headers = route.headers || {};

  const respond = function sendResponse() {
    if (cors) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }

    let bodyStr;
    if (body === null || body === undefined) {
      bodyStr = '';
      res.setHeader('Content-Type', headers['Content-Type'] || 'text/plain');
    } else if (typeof body === 'object') {
      bodyStr = JSON.stringify(body);
      res.setHeader('Content-Type', headers['Content-Type'] || 'application/json');
    } else {
      bodyStr = String(body);
      res.setHeader('Content-Type', headers['Content-Type'] || 'text/plain');
    }

    Object.entries(headers).forEach(([k, v]) => {
      if (k !== 'Content-Type') res.setHeader(k, v);
    });

    res.writeHead(status);
    res.end(bodyStr);
  };

  const delay = route.delay || 0;
  if (delay > 0) setTimeout(respond, delay);
  else respond();
}

/**
 * Creates a router function from a route configuration array.
 * @param {Array<object>} routes - Route definitions.
 * @param {object}  [opts]       - Options.
 * @param {boolean} [opts.cors=false] - Add CORS headers to all responses.
 * @returns {Function} Node.js http.Server request handler.
 */
function createRouter(routes, opts) {
  opts = opts || {};

  return function requestHandler(req, res) {
    if (opts.cors && req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.writeHead(204);
      res.end();
      return;
    }

    const query = parseQueryString(req.url);
    const match = matchRoute(routes, req.method, req.url);

    if (!match) {
      if (opts.cors) res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found', path: req.url, method: req.method }));
      return;
    }

    handleRequest(match.route, req, res, match.params, query, opts.cors || false);
  };
}

/**
 * Creates and configures an http.Server from a full config object.
 *
 * @param {object}          config               - Server configuration.
 * @param {Array<object>}   config.routes         - Route definitions.
 * @param {number}          [config.port=3000]    - Port to listen on.
 * @param {boolean}         [config.cors=false]   - Enable CORS headers.
 * @param {number}          [config.delay=0]      - Global default delay (ms).
 * @returns {http.Server} Configured Node.js HTTP server (not yet listening).
 *
 * @example
 * const { createServer } = require('@idirdev/mock-api-server');
 * const server = createServer({
 *   cors: true,
 *   routes: [
 *     { method: 'GET', path: '/users',     status: 200, body: [{ id: 1 }] },
 *     { method: 'GET', path: '/users/:id', status: 200, body: { id: 1 }  },
 *   ],
 * });
 * server.listen(3000);
 */
function createServer(config) {
  config = config || {};
  const routes = (config.routes || []).map((r) =>
    Object.assign({}, r, { delay: r.delay !== undefined ? r.delay : (config.delay || 0) })
  );
  const handler = createRouter(routes, { cors: config.cors || false });
  return http.createServer(handler);
}

module.exports = {
  createServer,
  createRouter,
  matchRoute,
  extractParams,
  parseQueryString,
  addRoute,
  removeRoute,
};
