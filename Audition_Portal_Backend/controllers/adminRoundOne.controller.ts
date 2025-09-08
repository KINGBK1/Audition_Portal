import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import { PrismaClient, Option, Role } from "@prisma/client";

const prisma = new PrismaClient();

//fetching all the user with role User
export const fetchAllCandidates = asyncHandler(async (req, res) => {
  const candidates = await prisma.user.findMany({
    where: { role: Role.USER },
    select: {
      id: true,
      username: true,
      email: true,
      contact: true,
      round: true,
    },
  });
  return(res.json(candidates));
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
// contains bug
export const getCandidateResponses = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    throw new ApiError(
      400,
      "Invalid or missing user ID in request parameters."
    );
  }
  const responses = await prisma.answer.findMany({
    where: { userId: Number(userId) },
    include: {
      // question: true,
      option: true,
    },
  });

  if (!responses) {
    throw new ApiError(401, "no response found..");
  }

  res
    .status(200)
    .json(new ApiResponse(200, responses, "responses fetched successfully.."));
});

//submitting evaulation of candidate by member/admin
export const submitEvaluation = asyncHandler(async (req, res) => {
  const { auditionRoundId, panel, remarks, finalSelection, evaluatedBy } =
    req.body;

  if (typeof evaluatedBy !== "string" || !evaluatedBy.trim()) {
    throw new ApiError(400, "`evaluatedBy` must be a non-empty string");
  }
  if (typeof remarks !== "string" || !remarks.trim()) {
    throw new ApiError(400, "`remarks` must be a non-empty string");
  }

  const review = await prisma.review.create({
    data: {
      auditionRoundId,
      panel,
      remarks,
      evaluatedBy,
    },
  });

  await prisma.auditionRound.update({
    where: { id: auditionRoundId },
    data: { finalSelection },
  });

  res
    .status(200)
    .json(new ApiResponse(200, { review }, "Evaluation submitted"));
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

