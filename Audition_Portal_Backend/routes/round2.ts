import { Router } from 'express';

import { verifyJWT, verifyAdmin } from '../middleware/verifyJWT';
import {
  FetchUsers,
  CreateUpdateTask,
  AddTags,
  FetchReview,
  UpdateReview,
  GetRound2Data, // ADD THIS IMPORT
} from '../controllers/roundTwoController';

const router = Router();

// User routes - GET must come BEFORE POST to avoid route conflicts
router.get('/data', verifyJWT, GetRound2Data as any); // ADD THIS - User gets their own Round 2 data
router.post('/', verifyJWT, CreateUpdateTask as any);

// Admin routes
router.patch('/tags', verifyAdmin, AddTags as any);
router.get('/', verifyAdmin, FetchUsers as any);
router.get('/:id', verifyAdmin, FetchReview as any);
router.post('/:id', verifyAdmin, UpdateReview as any);

export default router;
