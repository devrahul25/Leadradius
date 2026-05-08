import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject, ZodEffects } from "zod";
import { ApiError } from "../utils/api-error";

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

/**
 * Validates `req.body`, `req.query`, `req.params` against a Zod object.
 * Replaces those properties with the parsed (and coerced) data.
 */
export function validate(schema: { body?: Schema; query?: Schema; params?: Schema }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query) as Record<string, never>;
      if (schema.params) req.params = schema.params.parse(req.params) as Record<string, never>;
      next();
    } catch (err) {
      const issues = (err as { issues?: unknown }).issues ?? err;
      next(ApiError.badRequest("Validation failed", issues));
    }
  };
}
