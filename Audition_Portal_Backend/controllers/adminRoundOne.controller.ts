import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import { PrismaClient, Option, Role } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// fetching all the user with role USER for Admin Dashboard
export const fetchAllCandidates = asyncHandler(async (req: Request, res: Response) => {
  const candidates = await prisma.user.findMany({
    where: { role: Role.USER },
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
    .json(new ApiResponse(200, candidates, "Candidates fetched successfully"));
});


//get the candidate details by using user id
export const getCandidatePersonalDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    throw new ApiError(
      400,
      "Invalid or missing user ID in request parameters."
    );
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
    throw new ApiError(401, "no candidate found..");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        candidateDetails,
        "candidate details fetched succesfully."
      )
    );
});

// getting candidate response of round one based on candidate id
// getting candidate response of round one based on candidate id
export const getCandidateResponses = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    throw new ApiError(400, "Invalid or missing user ID in request parameters.");
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
    .json(new ApiResponse(200, responses, "Responses fetched successfully"));
});


// submitting evaluation of candidate by member/admin
export const submitEvaluation = asyncHandler(
  async (req: Request, res: Response) => {
    let {
      auditionRoundId,
      userId,
      panel,
      remarks,
      finalSelection,
      evaluatedBy,
    } = req.body;

    // validate basic fields
    if (!evaluatedBy || typeof evaluatedBy !== "string") {
      throw new ApiError(400, "`evaluatedBy` must be a string");
    }
    if (!remarks || typeof remarks !== "string") {
      throw new ApiError(400, "`remarks` must be a string");
    }

    // Create auditionRound if not existing
    if (!auditionRoundId) {
      if (!userId) throw new ApiError(400, "userId required");

      const created = await prisma.auditionRound.create({
        data: {
          userId,
          round: 1,
          finalSelection,
          panel: panel ?? null,
        },
      });

      auditionRoundId = created.id;
    } else {
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

      if (!userId) throw new ApiError(400, "Unable to resolve userId");
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
      .json(new ApiResponse(200, {}, "Evaluation submitted successfully"));
  }
);


// getting full progress of candidate
export const getCandidateProgress = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    throw new ApiError(
      400,
      "Invalid or missing user ID in request parameters."
    );
  }
  const rounds = await prisma.auditionRound.findMany({
    where: { userId: Number(userId) },
    include: {
      reviews: true,
    },
    orderBy: { round: "asc" },
  });

  if (!rounds) {
    throw new ApiError(401, "Error while getting progress of the candidate..");
  }

  res.status(200).json(new ApiResponse(200, rounds));
});

// get task details for a user
export const getTaskDetails = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    throw new ApiError(400, "Valid userId is required");
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
      .json(new ApiResponse(200, { taskAlloted: "", taskLink: "" }, "No task found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, roundTwo, "Task details fetched successfully"));
});

// allot task to a candidate for round 2
export const allotTask = asyncHandler(async (req: Request, res: Response) => {
  const { userId, taskAlloted, taskLink } = req.body;

  if (!userId || typeof userId !== "number") {
    throw new ApiError(400, "Valid userId is required");
  }

  if (!taskAlloted || typeof taskAlloted !== "string") {
    throw new ApiError(400, "Task description is required");
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
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
      .json(new ApiResponse(200, roundTwo, "Task allotted successfully"));
  } catch (error) {
    console.error("Error allotting task:", error);
    throw new ApiError(500, "Failed to allot task");
  }
});

