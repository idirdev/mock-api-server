import express from "express";
import cors from "cors";
import { createRouter, getRouteSummary } from "./router";
import { loggerMiddleware } from "./middleware/logger";
import { routes } from "./config/routes";
import type { MockServerConfig } from "./types";

const config: MockServerConfig = {
  port: parseInt(process.env.PORT ?? "3456", 10),
  prefix: "/api",
  enableCors: true,
  enableLogging: true,
  defaultDelay: 0,
  routes,
};

function createServer(cfg: MockServerConfig): express.Express {
  const app = express();

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  if (cfg.enableCors) {
    app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      })
    );
  }

  // Logging
  if (cfg.enableLogging) {
    app.use(loggerMiddleware());
  }

  // Register mock routes
  console.log("\nRegistering routes:");
  console.log("─".repeat(60));
  const router = createRouter(cfg.routes, cfg.prefix);
  app.use(router);
  console.log("─".repeat(60));

  // Route listing endpoint
  app.get(`${cfg.prefix}/_routes`, (_req, res) => {
    const summary = getRouteSummary(cfg.routes, cfg.prefix);
    res.json({
      totalRoutes: summary.length,
      routes: summary,
    });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route not found. Visit ${cfg.prefix}/_routes for available endpoints.`,
      availableEndpoints: `${cfg.prefix}/_routes`,
    });
  });

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  });

  return app;
}

const app = createServer(config);

app.listen(config.port, () => {
  console.log(`\nMock API Server running at http://localhost:${config.port}`);
  console.log(`API prefix: ${config.prefix}`);
  console.log(`Route list: http://localhost:${config.port}${config.prefix}/_routes`);
  console.log(`Total routes: ${config.routes.length}\n`);
});

export { createServer };
