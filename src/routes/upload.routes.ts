import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);

router.post('/', upload.single('image'), uploadImage);

export default router;
