import { Response } from 'express';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

/**
 * Sets the refresh token as an HttpOnly, SameSite=Strict cookie.
 * HttpOnly: not accessible via JS (XSS protection)
 * Secure: HTTPS only in production
 * SameSite=Strict: no cross-site send (CSRF protection)
 */
export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth', // Cookie only sent to auth routes
  });
};

/**
 * Clears the refresh token cookie on logout.
 */
export const clearRefreshTokenCookie = (res: Response) => {
  res.cookie(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/api/v1/auth',
  });
};

export { REFRESH_COOKIE_NAME };
