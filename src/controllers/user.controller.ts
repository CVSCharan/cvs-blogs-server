import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as userService from '../services/user.service';
import { clearRefreshTokenCookie } from '../utils/cookie';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.user!.id);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteAccount(req.user!.id);
  clearRefreshTokenCookie(res);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
