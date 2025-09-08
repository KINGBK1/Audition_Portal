import { Router } from 'express';

import { verifyJWT, verifyAdmin } from '../middleware/verifyJWT';
import {
  FetchUsers,
  CreateUpdateTask,
  AddTags,
  FetchReview,
  UpdateReview,
} from '../controllers/roundTwoController';

const router = Router();

router.post('/', verifyJWT,CreateUpdateTask as any);
router.patch('/tags',verifyAdmin,  AddTags as any);
router.get('/', verifyAdmin,FetchUsers as any);
router.get('/:id',verifyAdmin, FetchReview as any);
router.post('/:id',verifyAdmin, UpdateReview as any);

export default router;
