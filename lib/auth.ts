/**
 * Auth helpers. Behaviour depends on whether NEXT_PUBLIC_API_URL is set:
 *   - With API URL: calls the backend POST /auth/login + /auth/register
 *   - Without:      pretends any plausible credentials are valid (mock mode)
 *
 * Sessions live in `auth-storage.ts` so they're shared with the API client.
 */

import { USE_API } from "./config";
import { api, ApiError } from "./api";
import { saveSession, loadSession, clearSession, type AuthSession } from "./auth-storage";

export type { AuthSession };
export { saveSession, loadSession, clearSession };

interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}
interface BackendAuthResult {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

/** Best-effort login. Tries the backend first, falls back to mock if API_URL is unset. */
export async function login(email: string, password: string): Promise<AuthSession> {
  if (USE_API) {
    const { data } = await api.postPublic<BackendAuthResult>("/auth/login", { email, password });
    const session: AuthSession = {
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      source: "api",
    };
    saveSession(session);
    return session;
  }
  return mockLogin(email, password);
}

export async function register(name: string, email: string, password: string): Promise<AuthSession> {
  if (USE_API) {
    const { data } = await api.postPublic<BackendAuthResult>("/auth/register", { name, email, password });
    const session: AuthSession = {
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      source: "api",
    };
    saveSession(session);
    return session;
  }
  return mockLogin(email, password, name);
}

export async function logout(): Promise<void> {
  const session = loadSession();
  if (USE_API && session?.source === "api") {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Best effort — even if the server rejects, clear local session.
      if (!(err instanceof ApiError) || err.status !== 401) {
        // eslint-disable-next-line no-console
        console.warn("Logout request failed:", err);
      }
    }
  }
  clearSession();
}

/** Mock fallback used when no API URL is configured. */
export function mockLogin(email: string, _password: string, name?: string): AuthSession {
  const fallback = email.split("@")[0].replace(/[._-]+/g, " ");
  const displayName = name ?? fallback.charAt(0).toUpperCase() + fallback.slice(1);
  const session: AuthSession = {
    email,
    name: displayName,
    accessToken: `mock.jwt.${Date.now().toString(36)}`,
    role: email.startsWith("admin") ? "admin" : "user",
    source: "mock",
  };
  saveSession(session);
  return session;
}
