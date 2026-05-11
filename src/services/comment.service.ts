import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { CreateCommentInput } from '../validators/schemas';
import { createNotification } from './notification.service';
import { NotificationType } from '@prisma/client';

export const createComment = async (userId: string, postId: string, input: CreateCommentInput) => {
  // Check if post exists and is not deleted
  const post = await prisma.post.findFirst({
    where: { id: postId, deletedAt: null },
    select: { id: true, authorId: true, title: true, slug: true },
  });

  if (!post) throw new AppError('Post not found', 404);

  // If parentId provided, check if parent comment exists
  if (input.parentId) {
    const parentComment = await prisma.comment.findFirst({
      where: { id: input.parentId, deletedAt: null },
      select: { id: true, authorId: true },
    });
    if (!parentComment) throw new AppError('Parent comment not found', 404);

    // Notify parent comment author if it's not the same person
    if (parentComment.authorId !== userId) {
      await createNotification({
        userId: parentComment.authorId,
        type: NotificationType.COMMENT_REPLY,
        title: 'New reply to your comment',
        message: `Someone replied to your comment on "${post.title}"`,
        link: `/posts/${post.slug}#comment-${input.parentId}`,
      }).catch(err => console.error('Failed to send notification', err));
    }
  }

  return await prisma.comment.create({
    data: {
      content: input.content,
      parentId: input.parentId,
      postId,
      authorId: userId,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
};

export const deleteComment = async (commentId: string, userId: string, userRole: string) => {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, deletedAt: null },
  });

  if (!comment) throw new AppError('Comment not found', 404);

  // Authorization: only author or admin can delete
  if (comment.authorId !== userId && userRole !== 'ADMIN') {
    throw new AppError('You do not have permission to delete this comment', 403);
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
};
