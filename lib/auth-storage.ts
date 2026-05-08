/**
 * Tiny localStorage shim for auth sessions, broken out so it can be imported
 * from both `lib/auth.ts` (mock + real flows) and `lib/api.ts` (token header).
 */

const STORAGE_KEY = "leadradius.auth";

export interface AuthSession {
  email: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  role: "user" | "admin";
  /** Marker that distinguishes real backend sessions from mocked ones. */
  source: "api" | "mock";
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
