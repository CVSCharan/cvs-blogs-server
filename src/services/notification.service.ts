import { prisma } from '../utils/prisma';
import { NotificationType } from '@prisma/client';

export const createNotification = async (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) => {
  return await prisma.notification.create({
    data,
  });
};

export const getMyNotifications = async (userId: string, options: { onlyUnread?: boolean } = {}) => {
  return await prisma.notification.findMany({
    where: {
      userId,
      ...(options.onlyUnread ? { isRead: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
