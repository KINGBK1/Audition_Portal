"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allotTask = exports.getTaskDetails = exports.getCandidateProgress = exports.submitEvaluation = exports.getCandidateResponses = exports.getCandidatePersonalDetails = exports.fetchAllCandidates = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// fetching all the user with role USER for Admin Dashboard
exports.fetchAllCandidates = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const candidates = await prisma.user.findMany({
        where: { role: client_2.Role.USER },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            username: true,
            email: true,
            contact: true,
            gender: true,
            specialization: true,
            hasGivenExam: true,
            createdAt: true,
            auditionRounds: {
                select: {
                    id: true,
                    round: true,
                    finalSelection: true,
                    panel: true,
                },
            },
            roundTwo: {
                select: {
                    panel: true,
                    status: true,
                    taskAlloted: true,
                    taskLink: true,
                },
            },
        },
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, candidates, "Candidates fetched successfully"));
});
//get the candidate details by using user id
exports.getCandidatePersonalDetails = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId || typeof userId !== "string") {
        throw new ApiError_1.ApiError(400, "Invalid or missing user ID in request parameters.");
    }
    const candidateDetails = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
            id: true,
            username: true,
            email: true,
            contact: true,
            picture: true,
            gender: true,
            specialization: true,
        },
    });
    if (!candidateDetails) {
        throw new ApiError_1.ApiError(401, "no candidate found..");
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, candidateDetails, "candidate details fetched succesfully."));
});
// getting candidate response of round one based on candidate id
// getting candidate response of round one based on candidate id
exports.getCandidateResponses = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId || typeof userId !== "string") {
        throw new ApiError_1.ApiError(400, "Invalid or missing user ID in request parameters.");
    }
    const responses = await prisma.answer.findMany({
        where: { userId: Number(userId) },
        select: {
            questionId: true,
            optionId: true,
            description: true,
        },
        orderBy: { questionId: "asc" },
    });
    // if user has no responses, just return empty array (no error)
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, responses, "Responses fetched successfully"));
});
// submitting evaluation of candidate by member/admin
exports.submitEvaluation = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    let { auditionRoundId, userId, panel, remarks, finalSelection, evaluatedBy, } = req.body;
    // validate basic fields
    if (!evaluatedBy || typeof evaluatedBy !== "string") {
        throw new ApiError_1.ApiError(400, "`evaluatedBy` must be a string");
    }
    if (!remarks || typeof remarks !== "string") {
        throw new ApiError_1.ApiError(400, "`remarks` must be a string");
    }
    // Create auditionRound if not existing
    if (!auditionRoundId) {
        if (!userId)
            throw new ApiError_1.ApiError(400, "userId required");
        const created = await prisma.auditionRound.create({
            data: {
                userId,
                round: 1,
                finalSelection,
                panel: panel ?? null,
            },
        });
        auditionRoundId = created.id;
    }
    else {
        await prisma.auditionRound.update({
            where: { id: auditionRoundId },
            data: {
                finalSelection,
                panel: panel ?? null,
            },
        });
    }
    // Create review log
    await prisma.review.create({
        data: {
            auditionRoundId,
            panel: panel ?? 0,
            remarks,
            evaluatedBy,
        },
    });
    //promotion to round2
    if (finalSelection === true && panel !== null) {
        //userId
        if (!userId) {
            const r = await prisma.auditionRound.findUnique({
                where: { id: auditionRoundId },
                select: { userId: true },
            });
            userId = r?.userId;
        }
        if (!userId)
            throw new ApiError_1.ApiError(400, "Unable to resolve userId");
        const userIdNumber = Number(userId);
        // update user.round -> set to 2
        await prisma.user.update({
            where: { id: userIdNumber },
            data: { round: 2 },
        });
        // create RoundTwo row OR update existing
        await prisma.roundTwo.upsert({
            where: { userId },
            update: {
                panel,
                status: "ASSIGNED",
            },
            create: {
                userId,
                panel,
                status: "ASSIGNED",
                taskAlloted: "",
                taskLink: "",
                addOns: [],
                tags: [],
            },
        });
        // update user's round to 2
        await prisma.user.update({
            where: { id: Number(userId) },
            data: { round: 2 },
        });
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, {}, "Evaluation submitted successfully"));
});
// getting full progress of candidate
exports.getCandidateProgress = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId || typeof userId !== "string") {
        throw new ApiError_1.ApiError(400, "Invalid or missing user ID in request parameters.");
    }
    const rounds = await prisma.auditionRound.findMany({
        where: { userId: Number(userId) },
        include: {
            reviews: true,
        },
        orderBy: { round: "asc" },
    });
    if (!rounds) {
        throw new ApiError_1.ApiError(401, "Error while getting progress of the candidate..");
    }
    res.status(200).json(new ApiResponse_1.ApiResponse(200, rounds));
});
// get task details for a user
exports.getTaskDetails = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId || typeof userId !== "string") {
        throw new ApiError_1.ApiError(400, "Valid userId is required");
    }
    const roundTwo = await prisma.roundTwo.findUnique({
        where: { userId: Number(userId) },
        select: {
            taskAlloted: true,
            taskLink: true,
        },
    });
    if (!roundTwo) {
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, { taskAlloted: "", taskLink: "" }, "No task found"));
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, roundTwo, "Task details fetched successfully"));
});
// allot task to a candidate for round 2
exports.allotTask = (0, AsyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, taskAlloted, taskLink } = req.body;
    if (!userId || typeof userId !== "number") {
        throw new ApiError_1.ApiError(400, "Valid userId is required");
    }
    if (!taskAlloted || typeof taskAlloted !== "string") {
        throw new ApiError_1.ApiError(400, "Task description is required");
    }
    try {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new ApiError_1.ApiError(404, "User not found");
        }
        // Create or update RoundTwo record with task
        const roundTwo = await prisma.roundTwo.upsert({
            where: { userId },
            update: {
                taskAlloted,
                taskLink: taskLink || "",
            },
            create: {
                userId,
                taskAlloted,
                taskLink: taskLink || "",
                panel: 0,
                status: "ASSIGNED",
                addOns: [],
                tags: [],
            },
        });
        return res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, roundTwo, "Task allotted successfully"));
    }
    catch (error) {
        console.error("Error allotting task:", error);
        throw new ApiError_1.ApiError(500, "Failed to allot task");
    }
});
