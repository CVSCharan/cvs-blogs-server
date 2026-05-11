import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { createNotification } from './notification.service';
import { NotificationType } from '@prisma/client';

// ─── Likes ───────────────────────────────────────────────────────────────────

export const toggleLike = async (userId: string, postId: string) => {
  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true, slug: true },
  });

  if (!post) throw new AppError('Post not found', 404);

  const like = await prisma.like.create({ data: { userId, postId } });

  // Notify author if it's not the same person
  if (post.authorId !== userId) {
    await createNotification({
      userId: post.authorId,
      type: NotificationType.SYSTEM_ALERT, // We could add LIKE type if needed
      title: 'New Like',
      message: `Someone liked your post "${post.title}"`,
      link: `/posts/${post.slug}`,
    }).catch((err) => console.error('Notification failed', err));
  }

  return { liked: true, like };
};

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export const toggleBookmark = async (userId: string, postId: string) => {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId, postId } });
  return { bookmarked: true };
};

// ─── Following ────────────────────────────────────────────────────────────────

export const toggleFollow = async (followerId: string, followingId: string) => {
  if (followerId === followingId) throw new AppError('You cannot follow yourself', 400);

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }

  const followingUser = await prisma.user.findUnique({ where: { id: followingId } });
  if (!followingUser) throw new AppError('User to follow not found', 404);

  await prisma.follow.create({ data: { followerId, followingId } });

  // Notify the followed user
  await createNotification({
    userId: followingId,
    type: NotificationType.SYSTEM_ALERT,
    title: 'New Follower',
    message: `Someone started following you`,
    link: `/users/${followerId}`,
  }).catch((err) => console.error('Notification failed', err));

  return { following: true };
};

export const getFollowers = async (userId: string) => {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: { select: { id: true, name: true, avatarUrl: true, bio: true } } },
  });
  return follows.map((f) => f.follower);
};

export const getFollowing = async (userId: string) => {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: { select: { id: true, name: true, avatarUrl: true, bio: true } } },
  });
  return follows.map((f) => f.following);
};
