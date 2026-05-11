import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema } from '../validators/schemas';

const router = Router();

// Public routes
router.get('/', postController.getPosts);
router.get('/:slug', postController.getPost);

// Protected routes
router.use(protect);

router.post('/', validate(createPostSchema), postController.createPost);
router.patch('/:id', validate(updatePostSchema), postController.updatePost);
router.delete('/:id', postController.deletePost);

export default router;
