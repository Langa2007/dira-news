import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createAiOutput, listAiOutputs } from '../controllers/aiOutputController.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin', 'editor', 'editor_in_chief'), asyncHandler(listAiOutputs));
router.post('/', requireAuth, requireRole('admin', 'editor_in_chief'), asyncHandler(createAiOutput));

export default router;

