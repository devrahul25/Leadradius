"use client";

/**
 * Tiny fetch wrapper that:
 *  - Prepends NEXT_PUBLIC_API_URL
 *  - Injects the JWT from localStorage as `Authorization: Bearer …`
 *  - Unwraps the standard `{success,message,data,pagination}` envelope
 *  - Throws ApiError on non-2xx responses with the backend's message
 */
import { API_URL } from "./config";
import { loadSession } from "./auth-storage";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResult<T> {
  data: T;
  pagination?: Pagination;
}

interface RequestOpts {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  /** Skip auth header even if a session is stored. */
  noAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOpts["query"]) {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiFetch<T = unknown>(path: string, opts: RequestOpts = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!opts.noAuth) {
    const session = loadSession();
    if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  let payload: { success?: boolean; message?: string; data?: T; pagination?: Pagination; error?: unknown } = {};
  try {
    payload = await res.json();
  } catch {
    // empty body — leave payload empty
  }

  if (!res.ok || payload.success === false) {
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(res.status, payload.message ?? `Request failed: ${res.status}`, payload.error);
  }

  return { data: payload.data as T, pagination: payload.pagination };
}

export const api = {
  get: <T>(p: string, q?: RequestOpts["query"]) => apiFetch<T>(p, { method: "GET", query: q }),
  post: <T>(p: string, body?: unknown) => apiFetch<T>(p, { method: "POST", body }),
  delete: <T>(p: string) => apiFetch<T>(p, { method: "DELETE" }),
  postPublic: <T>(p: string, body?: unknown) => apiFetch<T>(p, { method: "POST", body, noAuth: true }),
};
