import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as postService from '../services/post.service';

export const createPost = catchAsync(async (req: Request, res: Response) => {
  const post = await postService.createPost(req.user!.id, req.body);
  res.status(201).json({
    status: 'success',
    data: { post },
  });
});

export const getPosts = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, published, tag, search } = req.query;
  const result = await postService.getAllPosts({
    page: Number(page),
    limit: Number(limit),
    published: published === 'true' ? true : published === 'false' ? false : undefined,
    tag: tag as string,
    search: search as string,
  });


  res.status(200).json({
    status: 'success',
    ...result,
  });
});

export const getPost = catchAsync(async (req: Request, res: Response) => {
  const post = await postService.getPostBySlug(req.params.slug as string);
  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

export const updatePost = catchAsync(async (req: Request, res: Response) => {
  const post = await postService.updatePost(
    req.params.id as string,
    req.user!.id,
    req.user!.role,
    req.body
  );
  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

export const deletePost = catchAsync(async (req: Request, res: Response) => {
  await postService.deletePost(req.params.id as string, req.user!.id, req.user!.role);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

