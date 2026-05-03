import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

/* ── CORS: whitelist Replit proxy domains + localhost for dev ──────────────── */
const rawDomains = process.env["REPLIT_DOMAINS"] ?? "";
const allowedOrigins = rawDomains
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean)
  .flatMap((d) => [`https://${d}`, `http://${d}`]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed =
        allowedOrigins.some((o) => origin.startsWith(o)) ||
        origin.includes("localhost") ||
        origin.includes("replit.dev") ||
        origin.includes("repl.co");
      if (allowed) {
        callback(null, true);
      } else {
        logger.warn({ origin }, "CORS: blocked request from unlisted origin");
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
