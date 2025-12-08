import { Router, type Request, type Response } from "express";
import type { RouteDefinition } from "./types";

/**
 * Dynamically registers route definitions onto an Express Router.
 * Supports static responses (objects) and dynamic response functions.
 * Route-level delay is stored on the request for the delay middleware.
 */
export function createRouter(routeDefs: RouteDefinition[], prefix: string = ""): Router {
  const router = Router();

  for (const route of routeDefs) {
    const fullPath = prefix ? `${prefix}${route.path}` : route.path;
    const method = route.method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete";

    router[method](fullPath, (req: Request, res: Response) => {
      // Attach delay metadata for the delay middleware
      if (route.delay && route.delay > 0) {
        (req as any).__routeDelay = route.delay;
      }

      // Set custom headers if provided
      if (route.headers) {
        for (const [key, value] of Object.entries(route.headers)) {
          res.setHeader(key, value);
        }
      }

      // Compute response body
      let body: unknown;
      if (typeof route.response === "function") {
        try {
          body = route.response(req);
        } catch (err) {
          console.error(`Error in route handler ${route.method} ${route.path}:`, err);
          res.status(500).json({ error: "Internal mock server error" });
          return;
        }
      } else {
        body = route.response;
      }

      // Handle delay if present
      const delay = route.delay ?? 0;
      if (delay > 0) {
        const jitter = Math.floor(Math.random() * Math.min(delay * 0.2, 100));
        setTimeout(() => {
          res.status(route.status).json(body);
        }, delay + jitter);
      } else {
        res.status(route.status).json(body);
      }
    });

    console.log(
      `  ${route.method.padEnd(7)} ${fullPath}${route.description ? ` - ${route.description}` : ""}`
    );
  }

  return router;
}

/**
 * Returns a summary of all registered routes for documentation.
 */
export function getRouteSummary(routeDefs: RouteDefinition[], prefix: string = ""): Array<{
  method: string;
  path: string;
  status: number;
  delay: number;
  description: string;
}> {
  return routeDefs.map((route) => ({
    method: route.method,
    path: prefix ? `${prefix}${route.path}` : route.path,
    status: route.status,
    delay: route.delay ?? 0,
    description: route.description ?? "",
  }));
}
