import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as categoryService from '../services/category.service';

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({ status: 'success', data: { categories } });
});

export const getCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug as string);
  res.status(200).json({ status: 'success', data: { category } });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ status: 'success', data: { category } });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id as string, req.body);
  res.status(200).json({ status: 'success', data: { category } });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id as string);
  res.status(204).json({ status: 'success', data: null });
});
