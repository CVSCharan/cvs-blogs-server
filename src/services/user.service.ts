import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { UpdateProfileInput } from '../validators/schemas';

export const getUserById = async (userId: string) => {
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
    },
  });

  if (!user) throw new AppError('User not found', 404);
  return user;
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
  // Soft delete the user
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  // Optional: Revoke all refresh tokens
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
