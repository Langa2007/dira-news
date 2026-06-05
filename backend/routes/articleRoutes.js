import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createArticle, listArticles, listHotNews, publishArticle } from '../controllers/articleController.js';

const router = express.Router();

router.get('/', asyncHandler(listArticles));
router.get('/hot', asyncHandler(listHotNews));
router.post('/', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(createArticle));
router.post('/:id/publish', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(publishArticle));

export default router;
