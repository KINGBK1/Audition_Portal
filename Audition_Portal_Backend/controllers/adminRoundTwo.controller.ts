import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/AsyncHandler";
import { PrismaClient, Role } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Fetch all candidates in Round 2 (users with round >= 2)
export const fetchAllRoundTwoCandidates = asyncHandler(async (req: Request, res: Response) => {
  const candidates = await prisma.user.findMany({
    where: { 
      role: Role.USER,
      round: {
        gte: 2 // Fetch users with round >= 2 (includes Round 2 and Round 3)
      },
      roundTwo: {
        isNot: null // Only users who have Round 2 entry
      }
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      email: true,
      contact: true,
      gender: true,
      specialization: true,
      round: true,
      createdAt: true,
      auditionRounds: {
        select: {
          id: true,
          round: true,
          finalSelection: true,
          panel: true,
          reviews: {
            select: {
              id: true,
              remarks: true,
              evaluatedBy: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          round: "asc"
        }
      },
      roundTwo: {
        select: {
          id: true,
          panel: true,
          taskAlloted: true,
          taskLink: true,
          status: true,
          addOns: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          review: {
            select: {
              id: true,
              attendance: true,
              reviewedBy: true,
              taskgiven: true,
              clubPrefer: true,
              subDomain: true,
              hs_place: true,
              reviews: true,
              remarks: true,
              rating: true,
              gd: true,
              general: true,
              forwarded: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, candidates, "Round 2 candidates fetched successfully"));
});

// Get candidate personal details for Round 2
export const getRoundTwoCandidateDetails = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    throw new ApiError(
      400,
      "Invalid or missing user ID in request parameters."
    );
  }

  const candidate = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      username: true,
      email: true,
      contact: true,
      picture: true,
      gender: true,
      specialization: true,
      round: true,
      hasGivenExam: true,
      createdAt: true,
      auditionRounds: {
        select: {
          id: true,
          round: true,
          finalSelection: true,
          panel: true,
          createdAt: true,
          updatedAt: true,
          reviews: {
            select: {
              id: true,
              panel: true,
              remarks: true,
              evaluatedBy: true,
              createdAt: true,
            }
          }
        },
        orderBy: {
          round: "asc"
        }
      },
      roundTwo: {
        select: {
          id: true,
          panel: true,
          taskAlloted: true,
          taskLink: true,
          status: true,
          addOns: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          review: true,
        },
      },
    },
  });

  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  // Verify candidate is in Round 2
  if (!candidate.round || candidate.round < 2) {
    throw new ApiError(400, "Candidate is not in Round 2");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        candidate,
        "Round 2 candidate details fetched successfully"
      )
    );
});

// Submit or update Round 2 review
export const submitRoundTwoReview = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    roundTwoId,
    attendance,
    taskgiven,
    clubPrefer,
    subDomain,
    hs_place,
    reviews,
    remarks,
    rating,
    gd,
    general,
    forwarded, // optional: accept forwarded flag from client but do NOT treat it as final decision
  } = req.body as {
    userId: number;
    roundTwoId: string;
    attendance: boolean;
    taskgiven: string;
    clubPrefer: string;
    subDomain: string;
    hs_place: string;
    reviews: string[];
    remarks: string;
    rating: number;
    gd: boolean;
    general: boolean;
    forwarded?: boolean;
  };

  // Validate required fields
  if (!userId || !roundTwoId) {
    throw new ApiError(400, "userId and roundTwoId are required");
  }

  if (typeof rating !== "number" || rating < 0 || rating > 10) {
    throw new ApiError(400, "Rating must be a number between 0 and 10");
  }

  // Get reviewer's email from authenticated user
  const adminUser = req.user as { email?: string } | undefined;
  const reviewedBy = adminUser?.email || "admin@domain.com";

  // Verify user is in Round 2
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { round: true, roundTwo: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.round || user.round < 2) {
    throw new ApiError(400, "User is not in Round 2");
  }

  if (!user.roundTwo) {
    throw new ApiError(400, "User does not have Round 2 data");
  }

  // Determine forwarded flag to store in review record.
  // NOTE: storing this flag is OK for tracking, but it does NOT imply acceptance.
  const forwardedFlag = typeof forwarded === "boolean" ? forwarded : false;

  // Transaction: upsert review and ensure auditionRound exists for round 2.
  // IMPORTANT: Do NOT change user.round here or mark finalSelection for acceptance automatically.
  const result = await prisma.$transaction(async (tx) => {
    // 1) upsert RoundTwoReview
    const review = await tx.roundTwoReview.upsert({
      where: { roundTwoId: roundTwoId },
      update: {
        attendance,
        reviewedBy,
        taskgiven: taskgiven || "",
        clubPrefer: clubPrefer || "",
        subDomain: subDomain || "",
        hs_place: hs_place || "",
        reviews: reviews || [],
        remarks: remarks || "",
        rating,
        gd,
        general,
        forwarded: forwardedFlag,
      },
      create: {
        userId: Number(userId),
        roundTwoId: roundTwoId,
        attendance,
        reviewedBy,
        taskgiven: taskgiven || "",
        clubPrefer: clubPrefer || "",
        subDomain: subDomain || "",
        hs_place: hs_place || "",
        reviews: reviews || [],
        remarks: remarks || "",
        rating,
        gd,
        general,
        forwarded: forwardedFlag,
      },
    });

    // 2) update RoundTwo.status -> mark as REVIEWED (do NOT decide acceptance here)
    const roundTwo = await tx.roundTwo.update({
      where: { id: roundTwoId },
      data: {
        status: "REVIEWED",
      },
    });

    // 3) upsert AuditionRound for round = 2, but keep finalSelection null so accept/reject remains explicit
    const auditionRound = await tx.auditionRound.upsert({
      where: {
        userId_round: {
          userId: Number(userId),
          round: 2,
        },
      },
      update: {
        panel: roundTwo.panel ?? null,
        finalSelection: null, // explicitly leave as null until evaluation endpoint is used
      },
      create: {
        userId: Number(userId),
        round: 2,
        panel: roundTwo.panel ?? null,
        finalSelection: null,
      },
    });

    // DO NOT update user.round here. Promotion to round 3 happens in evaluateRoundTwoCandidate when admin clicks Accept.
    return { review, roundTwo, auditionRound };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...result, forwarded: forwardedFlag },
        "Round 2 review submitted successfully"
      )
    );
});


// Update Round 2 task assignment
export const updateRoundTwoTask = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { taskAlloted, taskLink, addOns, tags } = req.body;

  if (!userId || typeof userId !== "string") {
    throw new ApiError(400, "Invalid or missing user ID");
  }

  // Verify user is in Round 2
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { round: true, roundTwo: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.round || user.round < 2) {
    throw new ApiError(400, "User is not in Round 2");
  }

  if (!user.roundTwo) {
    throw new ApiError(400, "User does not have Round 2 data");
  }

  // Update RoundTwo entry
  const updatedRoundTwo = await prisma.roundTwo.update({
    where: { userId: Number(userId) },
    data: {
      taskAlloted: taskAlloted || user.roundTwo.taskAlloted,
      taskLink: taskLink || user.roundTwo.taskLink,
      addOns: addOns || user.roundTwo.addOns,
      tags: tags || user.roundTwo.tags,
      status: "TASK_ASSIGNED",
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedRoundTwo,
        "Round 2 task updated successfully"
      )
    );
});

// Get Round 2 statistics
export const getRoundTwoStatistics = asyncHandler(async (req: Request, res: Response) => {
  // Total users currently in Round 2 (round = 2)
  const totalRound2 = await prisma.user.count({
    where: {
      role: Role.USER,
      round: 2,
      roundTwo: { isNot: null },
    },
  });

  // Total users who were accepted to Round 3 (those who had Round 2 and now round = 3)
  const totalAccepted = await prisma.user.count({
    where: {
      role: Role.USER,
      round: 3,
      roundTwo: { isNot: null },
    },
  });

  // Total reviewed
  const totalReviewed = await prisma.roundTwoReview.count();

  // Total attended
  const totalAttended = await prisma.roundTwoReview.count({
    where: { attendance: true },
  });

  // Total forwarded (this is the "forwarded" flag in reviews, different from accepted)
  const totalForwarded = await prisma.roundTwoReview.count({
    where: { forwarded: true },
  });

  // Total not forwarded
  const totalNotForwarded = await prisma.roundTwoReview.count({
    where: { forwarded: false },
  });

  // Pending forward decision (reviewed but forward status not decided)
  const pendingForwardDecision = totalReviewed - (totalForwarded + totalNotForwarded);

  // Panel distribution
  const panelDistribution = await prisma.roundTwo.groupBy({
    by: ["panel"],
    _count: {
      panel: true,
    },
    orderBy: {
      panel: "asc",
    },
  });

  const statistics = {
    totalRound2,
    totalAccepted,
    totalReviewed,
    totalAttended,
    totalForwarded,
    totalNotForwarded,
    pendingForwardDecision,
    panelDistribution: panelDistribution.map((p) => ({
      panel: p.panel,
      count: p._count.panel,
    })),
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, statistics, "Round 2 statistics fetched successfully")
    );
});

// Accept or Reject a Round 2 candidate
export const evaluateRoundTwoCandidate = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    finalSelection,
    remarks,
  } = req.body as {
    userId: number;
    finalSelection: boolean;
    remarks?: string;
  };

  // Validate required fields
  if (!userId || typeof finalSelection !== "boolean") {
    throw new ApiError(400, "userId and finalSelection (boolean) are required");
  }

  // Get evaluator's email from authenticated user
  const adminUser = req.user as { email: string };
  const evaluatedBy = adminUser?.email || "admin@domain.com";

  // Verify user exists and is in Round 2
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { 
      id: true,
      username: true,
      email: true,
      round: true, 
      roundTwo: true,
      auditionRounds: {
        where: { round: 2 },
        select: { id: true, finalSelection: true }
      }
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.round || user.round < 2) {
    throw new ApiError(400, "User is not in Round 2");
  }

  if (!user.roundTwo) {
    throw new ApiError(400, "User does not have Round 2 data");
  }

  // Check if already evaluated
  const round2AuditionRound = user.auditionRounds.find(r => r.finalSelection !== null);
  if (round2AuditionRound) {
    throw new ApiError(400, "User has already been evaluated for Round 2");
  }

  // Perform evaluation in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update or create AuditionRound for Round 2 with finalSelection
    let auditionRoundId = user.auditionRounds[0]?.id;
    
    if (auditionRoundId) {
      await tx.auditionRound.update({
        where: { id: auditionRoundId },
        data: { finalSelection },
      });
    } else {
      // Create if not exists
      const newAuditionRound = await tx.auditionRound.create({
        data: {
          userId: Number(userId),
          round: 2,
          panel: user.roundTwo!.panel,
          finalSelection,
        },
      });
      auditionRoundId = newAuditionRound.id;
    }

    // Create a review entry
    await tx.review.create({
      data: {
        auditionRoundId,
        panel: user.roundTwo!.panel,
        remarks: remarks || (finalSelection ? "Accepted for Round 3" : "Rejected in Round 2"),
        evaluatedBy,
      },
    });

    // Update User.round based on finalSelection
    const updatedUser = await tx.user.update({
      where: { id: Number(userId) },
      data: {
        round: finalSelection ? 3 : 2, // Move to Round 3 if accepted, stay at Round 2 if rejected
      },
    });

    // Update RoundTwo status to show accepted/rejected tag
    await tx.roundTwo.update({
      where: { userId: Number(userId) },
      data: {
        status: finalSelection ? "ACCEPTED" : "REJECTED",
      },
    });

    return updatedUser;
  });

  const message = finalSelection 
    ? `User ${user.username} accepted and moved to Round 3`
    : `User ${user.username} rejected and will remain in Round 2`;

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, message)
    );
});

// Forward or Not Forward a Round 2 candidate (after review)
export const forwardRoundTwoCandidate = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    forwarded,
    remarks,
  } = req.body as {
    userId: number;
    forwarded: boolean;
    remarks?: string;
  };

  // Validate required fields
  if (!userId || typeof forwarded !== "boolean") {
    throw new ApiError(400, "userId and forwarded (boolean) are required");
  }

  // Get evaluator's email from authenticated user
  const adminUser = req.user as { email: string };
  const reviewedBy = adminUser?.email || "admin@domain.com";

  // Verify user exists and is in Round 2
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { 
      id: true,
      username: true,
      email: true,
      round: true, 
      roundTwo: {
        select: {
          id: true,
          panel: true,
          review: true,
        }
      },
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.round || user.round < 2) {
    throw new ApiError(400, "User is not in Round 2");
  }

  if (!user.roundTwo) {
    throw new ApiError(400, "User does not have Round 2 data");
  }

  if (!user.roundTwo.review) {
    throw new ApiError(400, "User has not been reviewed yet. Please submit a review first.");
  }

  // Update review with forwarded status
  const review = await prisma.roundTwoReview.update({
    where: { roundTwoId: user.roundTwo.id },
    data: {
      forwarded,
      remarks: remarks || (forwarded ? "Forwarded to next stage" : "Not forwarded"),
      reviewedBy, // Update who made the forward decision
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          round: true,
        }
      }
    }
  });

  const message = forwarded 
    ? `User ${user.username} forwarded to next stage`
    : `User ${user.username} not forwarded`;

  return res
    .status(200)
    .json(
      new ApiResponse(200, review, message)
    );
});

// Get candidates by panel for Round 2
export const getRoundTwoCandidatesByPanel = asyncHandler(async (req: Request, res: Response) => {
  const { panel } = req.params;

  if (!panel || typeof panel !== "string") {
    throw new ApiError(400, "Invalid or missing panel number");
  }

  const panelNumber = Number(panel);
  if (isNaN(panelNumber) || panelNumber < 1 || panelNumber > 6) {
    throw new ApiError(400, "Panel number must be between 1 and 6");
  }

  const candidates = await prisma.user.findMany({
    where: {
      role: Role.USER,
      round: { gte: 2 },
      roundTwo: {
        panel: panelNumber,
      },
    },
    orderBy: { username: "asc" },
    select: {
      id: true,
      username: true,
      email: true,
      contact: true,
      gender: true,
      specialization: true,
      round: true,
      roundTwo: {
        select: {
          id: true,
          panel: true,
          taskAlloted: true,
          taskLink: true,
          status: true,
          review: {
            select: {
              attendance: true,
              rating: true,
              forwarded: true,
              remarks: true,
            },
          },
        },
      },
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        candidates,
        `Panel ${panelNumber} candidates fetched successfully`
      )
    );
});
