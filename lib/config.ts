/**
 * Frontend runtime config. Set NEXT_PUBLIC_API_URL in `.env.local` to point
 * the app at the running backend. If unset, the app uses local mock data so
 * the UI works standalone.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export const USE_API = !!API_URL;
