import { Router } from "express";
require("dotenv").config();
import {
  fetchAllCandidates,
  getCandidatePersonalDetails,
  getCandidateProgress,
  getCandidateResponses,
  submitEvaluation,
} from "../controllers/adminRoundOne.controller";

const router = Router();

// Routes are not yet protected
router.route("/candidate").get(fetchAllCandidates);
router.route("/responses/:userId").get(getCandidateResponses);
router.route("/candidate-personal-details/:userId").get(getCandidatePersonalDetails);
router.route("/evaluate").post(submitEvaluation);
router.route("/progress/:userId").get(getCandidateProgress);



export default router;
