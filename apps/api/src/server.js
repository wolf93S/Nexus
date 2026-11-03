
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import "dotenv/config";
import { db, checkDatabase } from "./db.js";

const app = Fastify({
  logger: true,
  trustProxy: false
});

await app.register(helmet);

await app.register(cors, {
  origin: false
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute"
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
