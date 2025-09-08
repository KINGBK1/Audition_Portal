import { Request, Response } from "express";
import { PrismaClient, Option } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

const getQuizzes = async (req: Request, res: Response): Promise<Response> => {
  const quizId = parseInt(req.params.id, 10);
  if (isNaN(quizId)) {
    return res.status(400).json({ message: "Invalid quiz ID." });
  }

  try {
    const quiz = await prisma.question.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    return res.status(200).json({ quiz });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

const createQuizzes = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { question, options, type, picture } = req.body;

  if (!question || !type) {
    return res.status(400).json({ message: "Question and type are required." });
  }

  if (type === "MCQ" && (!options || !Array.isArray(options) || options.length === 0)) {
    return res.status(400).json({ message: "Options are required for MCQ type." });
  }

  if (type !== "MCQ" && options && options.length > 0) {
    return res.status(400).json({ message: "Options should not be provided for non-MCQ questions." });
  }

  try {
    const createdQuestion = await prisma.question.create({
      data: {
        description: question,
        type,
        picture,
        options: type === "MCQ"
          ? {
              create: options.map((opt: { text: string; isCorrect: boolean }) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
              })),
            }
          : undefined,
      },
      include: { options: true },
    });

    return res.status(201).json({ message: "Question created successfully", question: createdQuestion });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


const answerQuiz = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const user = req.user;
  

  if (!user) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const { answers } = req.body;
  console.log(" Exam submission request received", req.body);
  console.log(" Authenticated user info:", user);

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Answers are required." });
  }

  try {

if (!user?.email) {
  return res.status(401).json({ message: "User email missing in token." });
}
    // Check if the user actually exists in the DB
    const existingUser = await prisma.user.findUnique({
      where: { email:user.email }, // safer than using id
    });

    if (!existingUser) {
      console.error("User not found in the database with email:", user.email);
      return res.status(404).json({ message: "User not found in the database." });
    }

    for (const answer of answers) {
      const { questionId, option, ans } = answer;

      const question = await prisma.question.findUnique({ where: { id: questionId } });
      if (!question) continue;

      await prisma.answer.create({
        data: {
          optionId: option?.id || null,
          description: ans || "",
          questionId,
          userId: existingUser.id, // use confirmed user.id
        },
      });
    }

    await prisma.user.update({
      where: { email: user.email },
      data: { hasGivenExam: true },
    });

    return res.status(201).json({ message: "Exam submitted successfully" });
  } catch (err: any) {
    console.error("Error in answerQuiz:", err);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};





const getQuizz = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        options: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.status(200).json(questions);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
}


const deleteQuiz = async (req: Request, res: Response): Promise<Response> => {
  const quizId = parseInt(req.params.id, 10);
  if (isNaN(quizId)) {
    return res.status(400).json({ message: "Invalid quiz ID." });
  }

  try {
    // Optional: If you don't have `onDelete: Cascade` set up
    await prisma.option.deleteMany({
      where: { questionId: quizId },
    });

    await prisma.question.delete({
      where: { id: quizId },
    });

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /api/quiz/:id error:", err);
    return res.status(500).json({ message: err.message });
  }
};



export { getQuizzes, createQuizzes, answerQuiz, getQuizz, deleteQuiz };
