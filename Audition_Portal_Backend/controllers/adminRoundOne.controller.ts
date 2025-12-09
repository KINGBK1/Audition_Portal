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
export const submitEvaluation = asyncHandler(async (req: Request, res: Response) => {
  let {
    auditionRoundId,
    userId,
    panel,
    remarks,
    finalSelection,
    evaluatedBy,
  } = req.body as {
    auditionRoundId?: number;
    userId?: number;
    panel: number | null;
    remarks: string;
    finalSelection: boolean;
    evaluatedBy: string;
  };

  if (typeof evaluatedBy !== "string" || !evaluatedBy.trim()) {
    throw new ApiError(400, "`evaluatedBy` must be a non-empty string");
  }
  if (typeof remarks !== "string" || !remarks.trim()) {
    throw new ApiError(400, "`remarks` must be a non-empty string");
  }

  // 1) Ensure we have an auditionRoundId (create round 1 if needed)
  if (!auditionRoundId) {
    if (!userId) {
      throw new ApiError(
        400,
        "userId is required when auditionRoundId is not provided",
      );
    }

    const createdRound = await prisma.auditionRound.create({
      data: {
        userId: Number(userId),
        round: 1,
        finalSelection,
        panel: panel ?? null,
      },
    });
    auditionRoundId = createdRound.id;
  } else {
    // Update existing auditionRound
    await prisma.auditionRound.update({
      where: { id: Number(auditionRoundId) },
      data: {
        finalSelection,
        panel: panel ?? null,
      },
    });
  }

  // 2) Create a review entry
  const review = await prisma.review.create({
    data: {
      auditionRoundId: Number(auditionRoundId),
      panel: panel ?? 0,
      remarks,
      evaluatedBy,
    },
  });

  // 3) If selected for round 2 and panel given, upsert RoundTwo
  if (finalSelection && panel !== null) {
    // ensure we know userId (if it wasn't in body, fetch from auditionRound)
    if (!userId) {
      const round = await prisma.auditionRound.findUnique({
        where: { id: Number(auditionRoundId) },
        select: { userId: true },
      });
      userId = round?.userId;
    }

    if (userId) {
      await prisma.roundTwo.upsert({
        where: { userId: Number(userId) },
        update: {
          panel,
          status: "ASSIGNED",
        },
        create: {
          userId: Number(userId),
          panel,
          status: "ASSIGNED",
          taskAlloted: "",
          taskLink: "",
          addOns: [],
          tags: [],
        },
      });
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { review, auditionRoundId },
        "Evaluation submitted",
      ),
    );
});


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

