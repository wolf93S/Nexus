import {
  registerSchema,
  loginSchema
} from "../schemas/auth.schema.js";

import {
  registerUser,
  authenticateUser
} from "../services/auth.service.js";

export default async function authRoutes(app) {
  app.post("/register", async (request, reply) => {
    const validation = registerSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.code(400).send({
        error: "Invalid registration data",
        details: validation.error.flatten()
      });
    }

    try {
      const user = await registerUser(validation.data);

      return reply.code(201).send({
        message: "Account created successfully",
        user
      });
    } catch (error) {
      if (error.code === "23505") {
        return reply.code(409).send({
          error: "Username or email already exists"
        });
      }

      request.log.error(error);

      return reply.code(500).send({
        error: "Internal server error"
      });
    }
  });

  app.post("/login", async (request, reply) => {
    const validation = loginSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.code(400).send({
        error: "Invalid login data"
      });
    }

    try {
      const user = await authenticateUser(validation.data);

      if (!user) {
        return reply.code(401).send({
          error: "Invalid email or password"
        });
      }

      return reply.code(200).send({
        message: "Authentication successful",
        user
      });
    } catch (error) {
      request.log.error(error);

      return reply.code(500).send({
        error: "Internal server error"
      });
    }
  });
}