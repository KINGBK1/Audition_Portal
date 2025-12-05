import { Router, Request, Response } from "express";
import {
  createQuizzes,
  getQuizzes,
  answerQuiz,
  getQuizz,
  deleteQuiz,
} from "../controllers/quizController";
import { verifyAdmin, verifyJWT } from "../middleware/verifyJWT";
import { PrismaClient, QuestionType } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// IMPORTANT: define this BEFORE `/:id`
router.get("/questions", verifyJWT, async (req: Request, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      include: { options: true },
    });

    const safeQuestions = questions.map((q) => ({
      id: q.id,
      description: q.description,
      picture: q.picture,
      type: q.type,
      options:
        q.type === QuestionType.MCQ || q.type === QuestionType.Pictorial
          ? q.options.map((opt) => ({
              id: opt.id,
              text: opt.text,
            }))
          : [],
    }));

    res.status(200).json(safeQuestions);
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    res.status(500).json({ message: "Failed to fetch quiz questions" });
  }
});

// existing routes
router.post("/create", createQuizzes as any);
router.get("/:id", verifyJWT, getQuizzes as any);
router.post("/answer", verifyJWT, answerQuiz as any);
router.get("/", verifyJWT, getQuizz as any);
router.delete("/:id", verifyJWT, deleteQuiz as any);

export default router;
