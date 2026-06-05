import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createMedia, listMedia } from '../controllers/mediaController.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(listMedia));
router.post('/', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(createMedia));

export default router;

