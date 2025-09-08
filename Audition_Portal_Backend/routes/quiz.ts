import { Router } from 'express';
import { createQuizzes, getQuizzes, answerQuiz, getQuizz, deleteQuiz } from '../controllers/quizController';
import { verifyAdmin, verifyJWT } from '../middleware/verifyJWT';

const router = Router();

// router.post('/create', verifyAdmin, createQuizzes as any);
router.post('/create', createQuizzes as any);
router.get('/:id', verifyJWT, getQuizzes as any);
router.post('/answer', verifyJWT, answerQuiz as any);
router.get('/', verifyJWT, getQuizz as any);
router.delete('/:id', verifyJWT, deleteQuiz as any);

export default router;
