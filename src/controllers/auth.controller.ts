import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  logoutAllDevices,
} from '../services/auth.service';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
} from '../utils/cookie';

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    status: 'success',
    data: { user, accessToken },
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: { user, accessToken },
  });
});

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!rawToken) throw new AppError('No refresh token provided.', 401);

  const { user, accessToken, refreshToken } = await refreshTokens(rawToken);

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: { user, accessToken },
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = catchAsync(async (req: Request, res: Response) => {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (rawToken) await logoutUser(rawToken);

  clearRefreshTokenCookie(res);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

// ─── Logout All Devices ───────────────────────────────────────────────────────

export const logoutAll = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Not authenticated.', 401);

  await logoutAllDevices(req.user.id);
  clearRefreshTokenCookie(res);

  res.status(200).json({
    status: 'success',
    message: 'Logged out of all devices.',
  });
});

// ─── Me ───────────────────────────────────────────────────────────────────────

export const getMe = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});
