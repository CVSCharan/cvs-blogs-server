import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { slugify } from '../utils/slugify';

export const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { deletedAt: null, published: true },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          tags: true,
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) throw new AppError('Category not found', 404);
  return category;
};

export const createCategory = async (data: { name: string; description?: string }) => {
  const slug = slugify(data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError('Category already exists', 400);

  return await prisma.category.create({
    data: { ...data, slug },
  });
};

export const updateCategory = async (id: string, data: { name?: string; description?: string }) => {
  const updateData: any = { ...data };
  if (data.name) {
    updateData.slug = slugify(data.name);
  }

  return await prisma.category.update({
    where: { id },
    data: updateData,
  });
};

export const deleteCategory = async (id: string) => {
  // Check if any posts are using this category
  const postsCount = await prisma.post.count({ where: { categoryId: id } });
  if (postsCount > 0) {
    throw new AppError('Cannot delete category with active posts', 400);
  }

  await prisma.category.delete({ where: { id } });
};
