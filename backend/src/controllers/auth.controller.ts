import { asyncHandler } from "../utils/async-handler";
import { authService } from "../services/auth.service";
import { ok, created } from "../utils/response";
import { ApiError } from "../utils/api-error";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return created(res, result, "Registered");
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    return ok(res, result, "Logged in");
  }),

  refresh: asyncHandler(async (req, res) => {
    const result = await authService.refresh(req.body.refreshToken);
    return ok(res, result, "Tokens refreshed");
  }),

  logout: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    await authService.logout(req.user.sub);
    return ok(res, null, "Logged out");
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    return ok(res, result, "If the account exists, a reset link has been issued");
  }),

  resetPassword: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    return ok(res, null, "Password reset");
  }),

  me: asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    return ok(res, { id: req.user.sub, email: req.user.email, role: req.user.role });
  }),
};
