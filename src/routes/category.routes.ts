import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategory);

// Admin only
router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
