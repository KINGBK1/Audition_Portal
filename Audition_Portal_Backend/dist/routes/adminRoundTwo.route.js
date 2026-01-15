"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminRoundTwo_controller_1 = require("../controllers/adminRoundTwo.controller");
const verifyJWT_1 = require("../middleware/verifyJWT");
const router = (0, express_1.Router)();
// Get all Round 2 candidates (users with round >= 2)
router.get("/candidate", verifyJWT_1.verifyAdmin, adminRoundTwo_controller_1.fetchAllRoundTwoCandidates);
// Get personal details of a Round 2 candidate
router.get("/candidate-details/:userId", verifyJWT_1.verifyAdmin, adminRoundTwo_controller_1.getRoundTwoCandidateDetails);
// Submit or update Round 2 review
router.post("/review", verifyJWT_1.verifyAdmin, adminRoundTwo_controller_1.submitRoundTwoReview);
// Evaluate Round 2 candidate (Accept/Reject) - Updates User.round to 3 or keeps at 2
router.post("/evaluate", verifyJWT_1.verifyAdmin, adminRoundTwo_controller_1.evaluateRoundTwoCandidate);
// Forward or Not Forward Round 2 candidate (after review)
router.post("/forward", verifyJWT_1.verifyAdmin, adminRoundTwo_controller_1.forwardRoundTwoCandidate);
// Update Round 2 task assignment
router.put("/task/:userId", verifyJWT_1.verifyAdmin, adminRoundTwo_controller_1.updateRoundTwoTask);
// Get Round 2 statistics
router.get("/statistics", verifyJWT_1.verifyAdmin, adminRoundTwo_controller_1.getRoundTwoStatistics);
// Get candidates by panel
router.get("/panel/:panel", verifyJWT_1.verifyAdmin, adminRoundTwo_controller_1.getRoundTwoCandidatesByPanel);
exports.default = router;
