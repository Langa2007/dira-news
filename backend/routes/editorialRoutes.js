import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
  attachEvidence,
  correctArticle,
  createComment,
  getArticleWorkflow,
  reviewCluster,
  runAssistant,
  scheduleArticle,
  updateArticleVersion,
  updateClaimReview,
  updateMediaLicense
} from '../controllers/editorialController.js';

const router = express.Router();
const editorialRoles = ['admin', 'editor', 'editor_in_chief'];
const publishingRoles = ['admin', 'editor_in_chief'];

router.use(requireAuth);

router.get('/articles/:id/workflow', requireRole(...editorialRoles), asyncHandler(getArticleWorkflow));
router.patch('/story-clusters/:id/review', requireRole(...editorialRoles), asyncHandler(reviewCluster));
router.patch('/articles/:id/version', requireRole(...editorialRoles), asyncHandler(updateArticleVersion));
router.post('/articles/:id/comments', requireRole(...editorialRoles), asyncHandler(createComment));
router.post('/articles/:id/evidence', requireRole(...editorialRoles), asyncHandler(attachEvidence));
router.patch('/claims/:id/review', requireRole(...editorialRoles), asyncHandler(updateClaimReview));
router.patch('/media/:id/license', requireRole(...editorialRoles), asyncHandler(updateMediaLicense));
router.post('/articles/:id/schedule', requireRole(...publishingRoles), asyncHandler(scheduleArticle));
router.post('/articles/:id/corrections', requireRole(...publishingRoles), asyncHandler(correctArticle));
router.post('/assistant', requireRole(...editorialRoles), asyncHandler(runAssistant));

export default router;
