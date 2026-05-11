import { Router } from 'express';
import { getStats } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/stats', getStats);

export default router;
