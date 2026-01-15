"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controllers/quizController");
const verifyJWT_1 = require("../middleware/verifyJWT");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// IMPORTANT: define this BEFORE `/:id`
router.get("/questions", verifyJWT_1.verifyJWT, async (req, res) => {
    try {
        const questions = await prisma.question.findMany({
            include: { options: true },
        });
        const safeQuestions = questions.map((q) => ({
            id: q.id,
            description: q.description,
            picture: q.picture,
            type: q.type,
            options: q.type === client_1.QuestionType.MCQ || q.type === client_1.QuestionType.Pictorial
                ? q.options.map((opt) => ({
                    id: opt.id,
                    text: opt.text,
                }))
                : [],
        }));
        res.status(200).json(safeQuestions);
    }
    catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
});
// existing routes
router.post("/create", quizController_1.createQuizzes);
router.get("/:id", verifyJWT_1.verifyJWT, quizController_1.getQuizzes);
router.post("/answer", verifyJWT_1.verifyJWT, quizController_1.answerQuiz);
router.get("/", verifyJWT_1.verifyJWT, quizController_1.getQuizz);
router.delete("/:id", verifyJWT_1.verifyJWT, quizController_1.deleteQuiz);
exports.default = router;
