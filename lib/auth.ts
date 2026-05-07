/**
 * Mock auth for the prototype. In production, replace with a real JWT flow:
 *   - POST /api/auth/login → returns access + refresh tokens
 *   - Tokens stored in httpOnly cookies (NOT localStorage)
 *   - middleware.ts verifies the cookie on protected routes
 *
 * This module exists so the UI can demonstrate the full sign-in flow without a
 * backend. It pretends any plausible credentials are valid.
 */

const STORAGE_KEY = "leadradius.auth";

export interface AuthSession {
  email: string;
  name: string;
  token: string;
  role: "user" | "admin";
}

export function mockLogin(email: string, _password: string): AuthSession {
  const name = email.split("@")[0].replace(/[._-]+/g, " ");
  return {
    email,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    token: `mock.jwt.${Date.now().toString(36)}`,
    role: email.startsWith("admin") ? "admin" : "user",
  };
}

export function saveSession(s: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function loadSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
