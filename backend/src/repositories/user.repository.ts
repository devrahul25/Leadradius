import { prisma } from "../database/prisma";
import type { Prisma, User } from "@prisma/client";

/**
 * User repository — the only place we touch `prisma.user`. Service code talks
 * to repositories, repositories talk to Prisma. Makes it trivial to swap the
 * data store later or add caching at one layer.
 */
export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: number) => prisma.user.findUnique({ where: { id } }),
  create: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),
  setRefreshToken: (id: number, refreshToken: string | null) =>
    prisma.user.update({ where: { id }, data: { refreshToken } }),
  updatePassword: (id: number, hashed: string): Promise<User> =>
    prisma.user.update({ where: { id }, data: { password: hashed, refreshToken: null } }),

  list: (skip: number, take: number) =>
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  count: () => prisma.user.count(),
};
