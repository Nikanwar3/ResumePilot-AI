import { prisma } from '../config/database';
import { User, Session } from '@prisma/client';

export class UserRepository {
  async create(data: {
    email: string;
    password?: string;
    googleId?: string;
    name: string;
    avatar?: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { googleId } });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async createSession(data: {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
  }): Promise<Session> {
    return prisma.session.create({ data });
  }

  async findSessionByToken(refreshToken: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { refreshToken } });
  }

  async deleteSession(refreshToken: string): Promise<void> {
    await prisma.session.deleteMany({ where: { refreshToken } });
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  }

  async cleanExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

export const userRepository = new UserRepository();
