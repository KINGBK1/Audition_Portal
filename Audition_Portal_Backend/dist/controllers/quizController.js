"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuiz = exports.getQuizz = exports.answerQuiz = exports.createQuizzes = exports.getQuizzes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getQuizzes = async (req, res) => {
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
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};
exports.getQuizzes = getQuizzes;
const createQuizzes = async (req, res) => {
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
                        create: options.map((opt) => ({
                            text: opt.text,
                            isCorrect: opt.isCorrect,
                        })),
                    }
                    : undefined,
            },
            include: { options: true },
        });
        return res.status(201).json({ message: "Question created successfully", question: createdQuestion });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};
exports.createQuizzes = createQuizzes;
const answerQuiz = async (req, res) => {
    const user = req.user;
    if (!user || (!user.id && !user.email)) {
        console.error("answerQuiz: Missing user or user.id/email on req.user:", user);
        return res.status(401).json({ message: "User not authenticated." });
    }
    const userEmail = user.email;
    const userIdFromToken = user.id;
    const { answers } = req.body;
    console.log("Exam submission request received:", JSON.stringify(req.body, null, 2));
    console.log("Authenticated user (from token):", userEmail, "id:", userIdFromToken);
    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers are required." });
    }
    try {
        // 🔥 Look up by email first (more stable across DB resets)
        let existingUser = userEmail
            ? await prisma.user.findUnique({ where: { email: userEmail } })
            : null;
        // fallback to id if email lookup fails but id exists
        if (!existingUser && userIdFromToken) {
            existingUser = await prisma.user.findUnique({ where: { id: userIdFromToken } });
        }
        if (!existingUser) {
            console.error("User not found in the database with email/id:", userEmail, userIdFromToken);
            return res.status(404).json({ message: "User not found in the database." });
        }
        const userId = existingUser.id; // ✅ use DB-confirmed id from here
        // -------- store answers (unchanged) --------
        for (const answer of answers) {
            const { questionId, option, ans } = answer;
            const question = await prisma.question.findUnique({
                where: { id: questionId },
            });
            if (!question)
                continue;
            await prisma.answer.create({
                data: {
                    optionId: option?.id || null,
                    description: ans || "",
                    questionId,
                    userId,
                },
            });
        }
        // -------- compute score (unchanged) --------
        const mcqOptionIds = answers
            .map((a) => a.option?.id)
            .filter((id) => typeof id === "number");
        let score = 0;
        let total = mcqOptionIds.length;
        if (mcqOptionIds.length > 0) {
            const options = await prisma.option.findMany({
                where: { id: { in: mcqOptionIds } },
                select: { id: true, isCorrect: true },
            });
            const optionMap = new Map();
            options.forEach((opt) => optionMap.set(opt.id, opt.isCorrect));
            for (const ans of answers) {
                const optId = ans.option?.id;
                if (!optId)
                    continue;
                const isCorrect = optionMap.get(optId);
                if (isCorrect === true) {
                    score += 1;
                }
            }
        }
        // -------- save attempt & mark hasGivenExam --------
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId,
                score,
                total,
            },
        });
        await prisma.user.update({
            where: { id: userId },
            data: { hasGivenExam: true },
        });
        console.log("Exam submitted OK — score:", score, "total:", total);
        return res.status(201).json({
            message: "Exam submitted successfully",
            score,
            total,
            attemptId: attempt.id,
        });
    }
    catch (err) {
        console.error("Error in answerQuiz:", err);
        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
};
exports.answerQuiz = answerQuiz;
const getQuizz = async (req, res) => {
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
    }
    catch (error) {
        console.error('Failed to fetch questions:', error);
        return res.status(500).json({ error: 'Failed to fetch questions' });
    }
};
exports.getQuizz = getQuizz;
const deleteQuiz = async (req, res) => {
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
    }
    catch (err) {
        console.error("DELETE /api/quiz/:id error:", err);
        return res.status(500).json({ message: err.message });
    }
};
exports.deleteQuiz = deleteQuiz;
