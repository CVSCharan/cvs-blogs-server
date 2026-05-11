import { prisma } from '../utils/prisma';
import { slugify } from '../utils/slugify';
import { CreatePostInput, UpdatePostInput } from '../validators/schemas';
import { AppError } from '../utils/AppError';
import { getPagination, formatPaginatedResult } from '../utils/pagination';
import * as cache from '../utils/cache';

const clearPostsCache = () => {
  cache.flush();
};

const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const createPost = async (userId: string, input: CreatePostInput) => {
  const slug = slugify(input.title);

  const existing = await prisma.post.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const readTime = calculateReadTime(input.content);

  const post = await prisma.post.create({
    data: {
      ...input,
      slug: finalSlug,
      readTime,
      authorId: userId,
      tags: {
        connectOrCreate: input.tags?.map((tag) => ({
          where: { name: tag },
          create: { name: tag, slug: slugify(tag) },
        })),
      },
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      tags: true,
    },
  });

  clearPostsCache();
  return post;
};

export const getAllPosts = async (options: {
  page?: number;
  limit?: number;
  published?: boolean;
  tag?: string;
}) => {
  const { page, limit, skip } = getPagination(options);

  const where: any = { deletedAt: null }; // Soft delete filter
  if (options.published !== undefined) where.published = options.published;
  if (options.tag) {
    where.tags = { some: { name: options.tag } };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        tags: true,
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return formatPaginatedResult(posts, total, page, limit);
};

export const getPostBySlug = async (slug: string) => {
  const post = await prisma.post.findFirst({
    where: { slug, deletedAt: null }, // Soft delete filter
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true, bio: true },
      },
      tags: true,
      comments: {
        where: { parentId: null, deletedAt: null }, // Soft delete filter for comments
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          replies: {
            where: { deletedAt: null },
            include: {
              author: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post) throw new AppError('Post not found', 404);

  prisma.post
    .update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch((err) => console.error('Failed to increment view count', err));

  return post;
};

export const updatePost = async (
  postId: string,
  userId: string,
  userRole: string,
  input: UpdatePostInput
) => {
  const post = await prisma.post.findFirst({
    where: { id: postId, deletedAt: null }, // Soft delete filter
  });
  if (!post) throw new AppError('Post not found', 404);

  if (post.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError('You do not have permission to update this post', 403);
  }

  const updateData: any = { ...input };
  if (input.title) {
    updateData.slug = slugify(input.title);
  }
  if (input.content) {
    updateData.readTime = calculateReadTime(input.content);
  }

  if (input.tags) {
    updateData.tags = {
      set: [],
      connectOrCreate: input.tags.map((tag) => ({
        where: { name: tag },
        create: { name: tag, slug: slugify(tag) },
      })),
    };
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      tags: true,
    },
  });

  clearPostsCache();
  return updatedPost;
};

export const deletePost = async (postId: string, userId: string, userRole: string) => {
  const post = await prisma.post.findFirst({
    where: { id: postId, deletedAt: null }, // Soft delete filter
  });
  if (!post) throw new AppError('Post not found', 404);

  if (post.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError('You do not have permission to delete this post', 403);
  }

  // Soft delete
  await prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });

  clearPostsCache();
};
