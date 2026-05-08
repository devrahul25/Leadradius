import { z } from "zod";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long");

const email = z.string().email().toLowerCase().trim();

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email,
    password,
  }),
};

export const loginSchema = {
  body: z.object({
    email,
    password: z.string().min(1, "Password is required"),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({ email }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(10, "Reset token is required"),
    password,
  }),
};
