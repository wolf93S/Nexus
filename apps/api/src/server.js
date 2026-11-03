
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import "dotenv/config";
import { db, checkDatabase } from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters");
}

const app = Fastify({
  logger: true,
  trustProxy: false
});

const allowedOrigins = (
  process.env.WEB_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

await app.register(helmet);

await app.register(cors, {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute"
});

await app.register(jwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: "15m"
  }
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "NEXUS API",
    version: "1.0.0"
  };
});

app.get("/health/db", async (request, reply) => {
  try {
    await checkDatabase();

    return {
      status: "ok",
      database: "connected"
    };
  } catch (error) {
    request.log.error(error);

    return reply.code(503).send({
      status: "error",
      database: "disconnected"
    });
  }
});

await app.register(authRoutes, {
  prefix: "/api/auth"
});

await app.register(userRoutes, {
  prefix: "/api/users"
});

const start = async () => {
  try {
    await checkDatabase();

    app.log.info("PostgreSQL connection established");

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    await db.end();
    process.exit(1);
  }
};

app.addHook("onClose", async () => {
  await db.end();
});

start();
