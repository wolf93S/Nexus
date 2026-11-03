import argon2 from "argon2";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
};

export const hashPassword = async (password) => {
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Password must contain at least 12 characters");
  }

  return argon2.hash(password, ARGON2_OPTIONS);
};

export const verifyPassword = async (hash, password) => {
  if (
    typeof hash !== "string" ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return false;
  }

  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
};