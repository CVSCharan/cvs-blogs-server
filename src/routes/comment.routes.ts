import { Router } from 'express';
import { createComment, deleteComment } from '../controllers/comment.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../validators/schemas';

// mergeParams: true allows access to :postId from the parent router
const router = Router({ mergeParams: true });

router.use(protect);

router.post('/', validate(createCommentSchema), createComment);
router.delete('/:id', deleteComment);

export default router;
