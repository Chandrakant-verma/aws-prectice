import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import repositoryRoutes from "./routes/repositoryRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// server/src -> server -> server/public (where the built client is copied)
const CLIENT_DIST = path.join(__dirname, "..", "public");

const app = express();

app.use(
  helmet({
    // Same-origin SPA — relax CSP so the built client's bundle loads fine.
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "RepoLens API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/ai", aiRoutes);

// Any /api/* route not matched above is a real 404.
app.use("/api", notFoundHandler);

// Serve the built React app (present when the client has been built into
// server/public — see the Dockerfile). SPA fallback so client-side routes
// like /dashboard survive a hard refresh.
app.use(express.static(CLIENT_DIST));
app.get(/^\/(?!api).*/, (_req, res, next) => {
  res.sendFile(path.join(CLIENT_DIST, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.use(errorHandler);

export default app;
