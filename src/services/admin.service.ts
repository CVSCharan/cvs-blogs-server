import { prisma } from '../utils/prisma';

export const getSystemStats = async () => {
  const [userCount, postCount, commentCount, viewStats] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.comment.count({ where: { deletedAt: null } }),
    prisma.post.aggregate({
      _sum: { viewCount: true },
      _avg: { readTime: true },
    }),
  ]);

  // Get most popular posts
  const popularPosts = await prisma.post.findMany({
    where: { deletedAt: null },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: { id: true, title: true, viewCount: true, slug: true },
  });

  // Get recent registrations
  const recentUsers = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, email: true, createdAt: true },
  });

  return {
    overview: {
      totalUsers: userCount,
      totalPosts: postCount,
      totalComments: commentCount,
      totalViews: viewStats._sum.viewCount || 0,
      avgReadTime: Math.round(viewStats._avg.readTime || 0),
    },
    popularPosts,
    recentUsers,
  };
};
