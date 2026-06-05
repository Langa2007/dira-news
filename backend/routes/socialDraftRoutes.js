import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createSocialDraft, listSocialDrafts } from '../controllers/socialDraftController.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(listSocialDrafts));
router.post('/', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(createSocialDraft));

export default router;

