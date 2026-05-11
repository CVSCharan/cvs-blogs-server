import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { UpdateProfileInput } from '../validators/schemas';

export const getUserById = async (userId: string, currentUserId?: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: { where: { deletedAt: null, published: true } },
        },
      },
    },
  });

  if (!user) throw new AppError('User not found', 404);

  let isFollowing = false;
  if (currentUserId && currentUserId !== userId) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
    });
    isFollowing = !!follow;
  }

  return { ...user, isFollowing };
};

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  return await prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });
};

export const deleteAccount = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
