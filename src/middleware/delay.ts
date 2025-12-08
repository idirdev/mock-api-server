import type { Request, Response, NextFunction } from "express";

/**
 * Creates a middleware that introduces an artificial delay before
 * responding. Useful for simulating real-world network latency in
 * development and testing environments.
 *
 * @param ms - The delay in milliseconds. If 0, the request passes through immediately.
 * @returns Express middleware function
 */
export function delayMiddleware(ms: number) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    if (ms <= 0) {
      next();
      return;
    }

    const jitter = Math.floor(Math.random() * Math.min(ms * 0.3, 200));
    const actualDelay = ms + jitter;

    setTimeout(() => {
      next();
    }, actualDelay);
  };
}

/**
 * Creates a per-route delay middleware that reads the delay from
 * route metadata stored on the request object.
 */
export function routeDelayMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const delay = (req as any).__routeDelay;

    if (!delay || delay <= 0) {
      next();
      return;
    }

    const jitter = Math.floor(Math.random() * Math.min(delay * 0.2, 100));
    setTimeout(() => next(), delay + jitter);
  };
}
