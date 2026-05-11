import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema } from '../validators/schemas';
import commentRoutes from './comment.routes';

const router = Router();

// Nested routes
router.use('/:postId/comments', commentRoutes);

/**
 * @openapi
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: List all posts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of posts with pagination metadata
 */
router.get('/', postController.getPosts);

/**
 * @openapi
 * /posts/{slug}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a single post by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post details with comments
 *       404:
 *         description: Post not found
 */
router.get('/:slug', postController.getPost);


// Protected routes
router.use(protect);

router.post('/', validate(createPostSchema), postController.createPost);
router.patch('/:id', validate(updatePostSchema), postController.updatePost);
router.delete('/:id', postController.deletePost);

export default router;
