import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),

  email: z
    .string()
    .email()
    .max(255),

  password: z
    .string()
    .min(12)
    .max(128),

  displayName: z
    .string()
    .max(64)
    .optional()
});

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .max(255),

  password: z
    .string()
    .min(1)
    .max(128)
});