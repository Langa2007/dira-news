import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createSource, listSources, queueSourceFetch } from '../controllers/sourceController.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(listSources));
router.post('/', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(createSource));
router.post('/:id/fetch', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(queueSourceFetch));

export default router;
