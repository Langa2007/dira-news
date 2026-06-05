import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  createSource,
  createSourceDocument,
  listSourceDocuments,
  listSources,
  queueSourceFetch,
  updateSourceFetchStatus
} from '../controllers/sourceController.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(listSources));
router.get('/documents', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(listSourceDocuments));
router.post('/', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(createSource));
router.post('/:id/fetch', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(queueSourceFetch));
router.post('/:id/documents', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(createSourceDocument));
router.patch('/fetches/:id', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(updateSourceFetchStatus));

export default router;
