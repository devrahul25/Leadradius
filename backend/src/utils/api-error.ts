/**
 * Domain error type used across services. The error middleware knows how to
 * serialise this into the standard {success:false, message, error} envelope.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: unknown;
  public readonly code?: string;

  constructor(status: number, message: string, opts: { details?: unknown; code?: string } = {}) {
    super(message);
    this.status = status;
    this.details = opts.details;
    this.code = opts.code;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, { details, code: "BAD_REQUEST" });
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, { code: "UNAUTHORIZED" });
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message, { code: "FORBIDDEN" });
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message, { code: "NOT_FOUND" });
  }
  static conflict(message: string) {
    return new ApiError(409, message, { code: "CONFLICT" });
  }
  static tooMany(message = "Too many requests") {
    return new ApiError(429, message, { code: "RATE_LIMITED" });
  }
  static internal(message = "Internal server error", details?: unknown) {
    return new ApiError(500, message, { details, code: "INTERNAL" });
  }
}
