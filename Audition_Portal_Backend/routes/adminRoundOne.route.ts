import { Router } from "express";
import {
  fetchAllCandidates,
  getCandidatePersonalDetails,
  getCandidateProgress,
  getCandidateResponses,
  submitEvaluation,
  allotTask,
  getTaskDetails,
} from "../controllers/adminRoundOne.controller";

import { verifyAdmin } from "../middleware/verifyJWT";  

const router = Router();

router.get("/candidate", verifyAdmin, fetchAllCandidates);
router.get("/responses/:userId", verifyAdmin, getCandidateResponses);
router.post("/evaluate", verifyAdmin, submitEvaluation);
router.get("/candidate-personal-details/:userId", verifyAdmin, getCandidatePersonalDetails);
router.get("/progress/:userId", verifyAdmin, getCandidateProgress);
router.get("/task/:userId", verifyAdmin, getTaskDetails);
router.post("/task", verifyAdmin, allotTask);

export default router;
