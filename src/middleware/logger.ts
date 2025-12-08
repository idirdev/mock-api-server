import type { Request, Response, NextFunction } from "express";

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  white: "\x1b[37m",
};

function getMethodColor(method: string): string {
  switch (method) {
    case "GET":
      return COLORS.green;
    case "POST":
      return COLORS.blue;
    case "PUT":
    case "PATCH":
      return COLORS.yellow;
    case "DELETE":
      return COLORS.red;
    default:
      return COLORS.white;
  }
}

function getStatusColor(status: number): string {
  if (status >= 500) return COLORS.red;
  if (status >= 400) return COLORS.yellow;
  if (status >= 300) return COLORS.cyan;
  if (status >= 200) return COLORS.green;
  return COLORS.white;
}

function padMethod(method: string): string {
  return method.padEnd(7);
}

/**
 * Request logging middleware that outputs colored, formatted logs
 * including method, path, status code, and response time.
 */
export function loggerMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = process.hrtime.bigint();
    const timestamp = new Date().toISOString().slice(11, 23);

    res.on("finish", () => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      const duration = durationMs < 1000
        ? `${durationMs.toFixed(1)}ms`
        : `${(durationMs / 1000).toFixed(2)}s`;

      const methodColor = getMethodColor(req.method);
      const statusColor = getStatusColor(res.statusCode);

      const line = [
        `${COLORS.dim}${timestamp}${COLORS.reset}`,
        `${methodColor}${padMethod(req.method)}${COLORS.reset}`,
        `${req.originalUrl}`,
        `${statusColor}${res.statusCode}${COLORS.reset}`,
        `${COLORS.dim}${duration}${COLORS.reset}`,
      ].join("  ");

      console.log(line);
    });

    next();
  };
}
