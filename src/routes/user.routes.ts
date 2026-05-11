import { Router } from 'express';
import { getMe, updateMe, deleteMe } from '../controllers/user.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/schemas';

const router = Router();

router.use(protect);

router.get('/me', getMe);
router.patch('/me', validate(updateProfileSchema), updateMe);
router.delete('/me', deleteMe);

export default router;
