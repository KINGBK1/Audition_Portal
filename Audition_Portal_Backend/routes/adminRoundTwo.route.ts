import { Router } from "express";
import {
  fetchAllRoundTwoCandidates,
  getRoundTwoCandidateDetails,
  submitRoundTwoReview,
  updateRoundTwoTask,
  getRoundTwoStatistics,
  getRoundTwoCandidatesByPanel,
  evaluateRoundTwoCandidate,
  forwardRoundTwoCandidate,
} from "../controllers/adminRoundTwo.controller";

import { verifyAdmin } from "../middleware/verifyJWT";

const router = Router();

// Get all Round 2 candidates (users with round >= 2)
router.get("/candidate", verifyAdmin, fetchAllRoundTwoCandidates);

// Get personal details of a Round 2 candidate
router.get("/candidate-details/:userId", verifyAdmin, getRoundTwoCandidateDetails);

// Submit or update Round 2 review
router.post("/review", verifyAdmin, submitRoundTwoReview);

// Evaluate Round 2 candidate (Accept/Reject) - Updates User.round to 3 or keeps at 2
router.post("/evaluate", verifyAdmin, evaluateRoundTwoCandidate);

// Forward or Not Forward Round 2 candidate (after review)
router.post("/forward", verifyAdmin, forwardRoundTwoCandidate);

// Update Round 2 task assignment
router.put("/task/:userId", verifyAdmin, updateRoundTwoTask);

// Get Round 2 statistics
router.get("/statistics", verifyAdmin, getRoundTwoStatistics);

// Get candidates by panel
router.get("/panel/:panel", verifyAdmin, getRoundTwoCandidatesByPanel);

export default router;
