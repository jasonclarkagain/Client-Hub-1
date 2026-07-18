import { type RequestHandler } from "express";
import { logger } from "./logger";

const apiKey = process.env.API_SECRET_KEY;

if (!apiKey) {
  logger.warn("API_SECRET_KEY is not set — all protected routes will reject requests");
}

export const requireApiKey: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);
  if (!apiKey || token !== apiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};
