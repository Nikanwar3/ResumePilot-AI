import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { JWTPayload, TokenPair } from '../types';

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn as string,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn as string,
  } as jwt.SignOptions);
}

export function generateTokenPair(payload: JWTPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, jwtConfig.accessSecret) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, jwtConfig.refreshSecret) as JWTPayload;
}

export function getRefreshTokenExpiry(): Date {
  const days = parseInt(jwtConfig.refreshExpiresIn.replace('d', ''), 10) || 7;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}
