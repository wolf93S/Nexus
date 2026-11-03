
import { db } from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export const registerUser = async ({
  username,
  email,
  password,
  displayName
}) => {
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const passwordHash = await hashPassword(password);

  try {
    const result = await db.query(
      `INSERT INTO users (
        username,
        email,
        password_hash,
        display_name
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, display_name, created_at`,
      [
        normalizedUsername,
        normalizedEmail,
        passwordHash,
        displayName?.trim() || null
      ]
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      const duplicateError = new Error(
        "Username or email already exists"
      );

      duplicateError.code = "23505";
      throw duplicateError;
    }

    throw error;
  }
};

export const authenticateUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db.query(
    `SELECT id, username, email, password_hash, display_name
     FROM users
     WHERE email = $1
       AND deleted_at IS NULL
     LIMIT 1`,
    [normalizedEmail]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const user = result.rows[0];

  const validPassword = await verifyPassword(
    user.password_hash,
    password
  );

  if (!validPassword) {
    return null;
  }

  const { password_hash, ...safeUser } = user;

  return safeUser;
};
