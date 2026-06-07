import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { userRepository } from '../repositories/user.repository';
import { generateTokenPair, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';
import { TokenPair } from '../types';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  async register(data: { name: string; email: string; password: string }): Promise<{
    user: { id: string; name: string; email: string; avatar: string | null };
    tokens: TokenPair;
  }> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await userRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      tokens,
    };
  }

  async login(email: string, password: string): Promise<{
    user: { id: string; name: string; email: string; avatar: string | null };
    tokens: TokenPair;
  }> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await userRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      tokens,
    };
  }

  async googleAuth(idToken: string): Promise<{
    user: { id: string; name: string; email: string; avatar: string | null };
    tokens: TokenPair;
    isNew: boolean;
  }> {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError(400, 'Invalid Google token');
    }

    let user = await userRepository.findByGoogleId(payload.sub!);
    let isNew = false;

    if (!user) {
      user = await userRepository.findByEmail(payload.email);
      if (user) {
        user = await userRepository.update(user.id, { googleId: payload.sub });
      } else {
        user = await userRepository.create({
          name: payload.name || payload.email,
          email: payload.email,
          googleId: payload.sub,
          avatar: payload.picture,
        });
        isNew = true;
      }
    }

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await userRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      tokens,
      isNew,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const session = await userRepository.findSessionByToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError(401, 'User not found');
    }

    await userRepository.deleteSession(refreshToken);

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await userRepository.createSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await userRepository.deleteSession(refreshToken);
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    return { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, createdAt: user.createdAt };
  }
}

export const authService = new AuthService();
