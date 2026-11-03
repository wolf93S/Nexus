
import { db } from "../db.js";
import { authenticate } from "../utils/authenticate.js";

export default async function userRoutes(app) {
  app.get("/me", {
    preHandler: authenticate
  }, async (request, reply) => {
    const userId = request.user.sub;

    try {
      const result = await db.query(
        `SELECT id, username, email, display_name, created_at
         FROM users
         WHERE id = $1
           AND deleted_at IS NULL
         LIMIT 1`,
        [userId]
      );

      if (result.rowCount === 0) {
        return reply.code(404).send({
          error: "User not found"
        });
      }

      return reply.code(200).send({
        user: result.rows[0]
      });
    } catch (error) {
      request.log.error(error);

      return reply.code(500).send({
        error: "Internal server error"
      });
    }
  });
}
