import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/tokens";

/** Required: extracts and verifies a Bearer token, attaches `req.user`. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(ApiError.unauthorized("Missing bearer token"));
  req.user = verifyAccessToken(token);
  next();
}

/** Allow only the listed roles. Use after `requireAuth`. */
export function requireRole(...roles: Array<"user" | "admin">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden("Insufficient role"));
    next();
  };
}
