import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as socialService from '../services/social.service';

export const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const result = await socialService.toggleLike(req.user!.id, req.params.postId as string);
  res.status(200).json({ status: 'success', data: result });
});

export const toggleBookmark = catchAsync(async (req: Request, res: Response) => {
  const result = await socialService.toggleBookmark(req.user!.id, req.params.postId as string);
  res.status(200).json({ status: 'success', data: result });
});

export const toggleFollow = catchAsync(async (req: Request, res: Response) => {
  const result = await socialService.toggleFollow(req.user!.id, req.params.userId as string);
  res.status(200).json({ status: 'success', data: result });
});

export const getFollowers = catchAsync(async (req: Request, res: Response) => {
  const users = await socialService.getFollowers(req.params.userId as string);
  res.status(200).json({ status: 'success', data: { users } });
});

export const getFollowing = catchAsync(async (req: Request, res: Response) => {
  const users = await socialService.getFollowing(req.params.userId as string);
  res.status(200).json({ status: 'success', data: { users } });
});
