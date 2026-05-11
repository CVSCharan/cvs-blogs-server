import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../validators/schemas';
import logger from '../utils/logger';
import { AlertLevel, sendAdminAlert } from '../utils/adminAlert';

// ─── Constants ────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const signAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ id: userId }, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Creates and stores a new refresh token in the DB.
 * Returns the raw (unhashed) token to send to the client once.
 */
const createRefreshToken = async (userId: string, familyId: string): Promise<string> => {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

  await prisma.refreshToken.create({
    data: { tokenHash, familyId, userId, expiresAt },
  });

  return rawToken;
};

/**
 * Issues a full access + refresh token pair.
 */
const issueTokenPair = async (
  userId: string,
  familyId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = signAccessToken(userId);
  const refreshToken = await createRefreshToken(userId, familyId);
  return { accessToken, refreshToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findFirst({ 
    where: { email: input.email, deletedAt: null } 
  });
  if (existing) throw new AppError('An account with that email already exists.', 409);

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Admin Alert
  sendAdminAlert('New User Registered', `User: ${user.email}`, AlertLevel.INFO);

  const familyId = crypto.randomUUID();
  const tokens = await issueTokenPair(user.id, familyId);

  return { user, ...tokens };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findFirst({
    where: { email: input.email, deletedAt: null }, // Soft delete filter
    select: { id: true, name: true, email: true, role: true, password: true, createdAt: true },
  });

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const { password: _pw, ...safeUser } = user;

  const familyId = crypto.randomUUID();
  const tokens = await issueTokenPair(user.id, familyId);

  return { user: safeUser, ...tokens };
};

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const refreshTokens = async (rawToken: string) => {
  const tokenHash = hashToken(rawToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, role: true, deletedAt: true } } },
  });

  if (!stored || stored.user.deletedAt) throw new AppError('Invalid refresh token.', 401);

  if (stored.revokedAt) {
    const alertMessage = `User ID: ${stored.userId}, Family ID: ${stored.familyId}`;
    sendAdminAlert('Refresh Token Reuse Detected', alertMessage, AlertLevel.CRITICAL);

    logger.warn('Refresh token reuse detected — revoking entire family', {
      familyId: stored.familyId,
      userId: stored.userId,
    });
    
    await prisma.refreshToken.updateMany({
      where: { familyId: stored.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError('Token reuse detected. Please log in again.', 401);
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    throw new AppError('Refresh token has expired. Please log in again.', 401);
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokenPair(stored.userId, stored.familyId);
  return { user: { id: stored.user.id, email: stored.user.email, role: stored.user.role }, ...tokens };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutUser = async (rawToken: string) => {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

// ─── Logout All Devices ───────────────────────────────────────────────────────

export const logoutAllDevices = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
