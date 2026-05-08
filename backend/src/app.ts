import express, { type Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { httpLogStream, logger } from "./config/logger";
import { generalLimiter } from "./middlewares/rate-limit";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";
import { healthController } from "./controllers/health.controller";
import { swaggerDoc } from "./config/swagger";
import v1Router from "./routes/v1";

export function createApp(): Application {
  const app = express();

  // -- Security & infra middleware -----------------------------------------
  app.set("trust proxy", 1); // honour X-Forwarded-* when behind nginx/Plesk
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow same-origin / curl (no Origin header) and any whitelisted origin.
        if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS: origin not allowed: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev", { stream: httpLogStream }));
  }

  app.use(generalLimiter);

  // -- Public health checks (no rate-limiter, no auth) ---------------------
  app.get("/health", healthController.liveness);
  app.get("/ready", healthController.readiness);

  // -- API docs ------------------------------------------------------------
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

  // -- Versioned API -------------------------------------------------------
  app.use(env.API_PREFIX, v1Router);

  // -- 404 + error handler (must be last) ----------------------------------
  app.use(notFound);
  app.use(errorHandler);

  logger.info("Express app initialised", { prefix: env.API_PREFIX, env: env.NODE_ENV });
  return app;
}
