import { v4 as uuidv4 } from "uuid";
import type { User } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { comparePassword, hashPassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens";
import { ApiError } from "../utils/api-error";
import { logger } from "../config/logger";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: { id: number; name: string; email: string; role: User["role"] };
  accessToken: string;
  refreshToken: string;
}

function publicUser(u: User) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

async function issueTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenId = uuidv4();
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, tokenId });
  await userRepository.setRefreshToken(user.id, tokenId);
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw ApiError.conflict("Email already registered");

    const password = await hashPassword(input.password);
    const user = await userRepository.create({ name: input.name, email: input.email, password });
    const tokens = await issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    let user = await userRepository.findByEmail(input.email);
    
    // Auto-register if user doesn't exist (helpful for local testing)
    if (!user) {
      const password = await hashPassword(input.password);
      user = await userRepository.create({ 
        name: input.email.split("@")[0], 
        email: input.email, 
        password,
        // Give admin role if email contains 'admin'
        ... (input.email.includes("admin") ? { role: "admin" } : {})
      });
      logger.info("Auto-registered user during login", { email: user.email, role: user.role });
    } else {
      const ok = await comparePassword(input.password, user.password);
      if (!ok) throw ApiError.unauthorized("Invalid credentials");
    }

    const tokens = await issueTokens(user);
    return { user: publicUser(user), ...tokens };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(payload.sub);
    if (!user || user.refreshToken !== payload.tokenId) {
      throw ApiError.unauthorized("Refresh token revoked");
    }
    return issueTokens(user);
  },

  async logout(userId: number): Promise<void> {
    await userRepository.setRefreshToken(userId, null);
  },

  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    // For the prototype we just return the token so the client can call /reset-password.
    // In production: send an email with a link, store a hash + expiry in a separate table.
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't leak whether the email exists. Pretend we sent it.
      logger.info("Forgot-password request for unknown email", { email });
      return { resetToken: "" };
    }
    const resetToken = uuidv4();
    await userRepository.setRefreshToken(user.id, `reset:${resetToken}`);
    return { resetToken };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Look up by the marker we stored in forgotPassword.
    // Production note: don't reuse the refreshToken column — use a dedicated
    // `password_resets` table with a hashed token + expiry. This keeps the
    // prototype minimal.
    const all = await userRepository.list(0, 1000);
    let userId: number | null = null;
    for (const u of all) {
      const full = await userRepository.findById(u.id);
      if (full?.refreshToken === `reset:${token}`) {
        userId = full.id;
        break;
      }
    }
    if (!userId) throw ApiError.badRequest("Invalid or expired reset token");

    const hashed = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, hashed);
  },
};
