import type { AccessTokenPayload } from "../utils/tokens";

declare global {
  namespace Express {
    interface Request {
      /** Populated by the auth middleware after JWT verification. */
      user?: AccessTokenPayload;
    }
  }
}

export {};
