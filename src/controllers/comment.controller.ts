import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as commentService from '../services/comment.service';

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const comment = await commentService.createComment(
    req.user!.id,
    req.params.postId as string,
    req.body
  );
  res.status(201).json({
    status: 'success',
    data: { comment },
  });
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  await commentService.deleteComment(
    req.params.id as string,
    req.user!.id,
    req.user!.role
  );
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
