import { Router } from 'express';
import { toggleLike, toggleBookmark, toggleFollow, getFollowers, getFollowing } from '../controllers/social.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/users/:userId/followers', getFollowers);
router.get('/users/:userId/following', getFollowing);

// Protected routes
router.use(protect);

router.post('/posts/:postId/like', toggleLike);
router.post('/posts/:postId/bookmark', toggleBookmark);
router.post('/users/:userId/follow', toggleFollow);

export default router;
