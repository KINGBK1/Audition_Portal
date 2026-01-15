"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyJWT_1 = require("../middleware/verifyJWT");
const roundTwoController_1 = require("../controllers/roundTwoController");
const router = (0, express_1.Router)();
// User routes - GET must come BEFORE POST to avoid route conflicts
router.get('/data', verifyJWT_1.verifyJWT, roundTwoController_1.GetRound2Data); // ADD THIS - User gets their own Round 2 data
router.post('/', verifyJWT_1.verifyJWT, roundTwoController_1.CreateUpdateTask);
// Admin routes
router.patch('/tags', verifyJWT_1.verifyAdmin, roundTwoController_1.AddTags);
router.get('/', verifyJWT_1.verifyAdmin, roundTwoController_1.FetchUsers);
router.get('/:id', verifyJWT_1.verifyAdmin, roundTwoController_1.FetchReview);
router.post('/:id', verifyJWT_1.verifyAdmin, roundTwoController_1.UpdateReview);
exports.default = router;
