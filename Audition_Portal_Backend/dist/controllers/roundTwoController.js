"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReview = exports.FetchReview = exports.AddTags = exports.FetchUsers = exports.CreateUpdateTask = exports.GetRound2Data = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// USER SIDE
// ADD THIS NEW ENDPOINT - Get Round 2 data with review status
const GetRound2Data = async (req, res) => {
    const user = req.user;
    try {
        const roundTwoData = await prisma.roundTwo.findUnique({
            where: { userId: user.id },
            include: {
                review: true // Include review to check forwarded status
            }
        });
        return res.status(200).json({
            message: 'Round 2 data fetched successfully',
            entry: roundTwoData
        });
    }
    catch (err) {
        console.error('[Round2 Get Error]', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.GetRound2Data = GetRound2Data;
//Create or Update Round 2 Entry
const CreateUpdateTask = async (req, res) => {
    const { taskAlloted, taskLink, addOns, status, panel } = req.body;
    const user = req.user;
    if (!taskAlloted || !taskLink || !status || !Array.isArray(addOns)) {
        return res.status(400).json({ error: 'Missing or invalid required fields' });
    }
    try {
        // Check if entry already exists
        const existingEntry = await prisma.roundTwo.findUnique({
            where: { userId: user.id },
            include: {
                review: true
            }
        });
        // Handle panel assignment
        let finalPanel = panel;
        if (!finalPanel && existingEntry && existingEntry.panel) {
            finalPanel = existingEntry.panel;
        }
        else if (!finalPanel) {
            return res.status(400).json({ error: 'Panel is required for new entries' });
        }
        if (existingEntry) {
            // Update existing entry - only update taskLink and status, keep review intact
            const updatedEntry = await prisma.roundTwo.update({
                where: { userId: user.id },
                data: {
                    taskLink,
                    status,
                    // Don't update taskAlloted, addOns, or panel on resubmission
                },
            });
            return res.status(200).json({
                message: 'Saved successfully',
                entry: updatedEntry
            });
        }
        else {
            // Create new entry
            const newEntry = await prisma.roundTwo.create({
                data: {
                    panel: finalPanel,
                    taskAlloted,
                    taskLink,
                    status,
                    addOns,
                    tags: [],
                    user: { connect: { id: user.id } },
                },
            });
            return res.status(201).json({
                message: 'Saved successfully',
                entry: newEntry
            });
        }
    }
    catch (err) {
        console.error('[Round2 Error]', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.CreateUpdateTask = CreateUpdateTask;
// ADMIN SIDE
// Fetch All Users in Round 2
const FetchUsers = async (req, res) => {
    try {
        const candidates = await prisma.user.findMany({
            where: { role: client_1.Role.USER },
            select: {
                id: true,
                username: true,
                email: true,
                roundTwo: {
                    select: {
                        taskLink: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
        });
        return res.status(200).json({
            message: 'Round2 user summaries fetched successfully',
            candidates,
        });
    }
    catch (err) {
        console.error('[Round2 Fetch Error]', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.FetchUsers = FetchUsers;
// Add Tags to a User
const AddTags = async (req, res) => {
    const { tags, user } = req.body;
    if (!tags || !Array.isArray(tags) || !user?.id) {
        return res.status(400).json({
            error: 'Invalid tags format or missing user ID',
        });
    }
    try {
        const entry = await prisma.roundTwo.findUnique({
            where: { userId: user.id },
        });
        if (!entry) {
            return res.status(404).json({ error: 'No Round 2 task found for this user.' });
        }
        const updated = await prisma.roundTwo.update({
            where: { userId: user.id },
            data: { tags },
        });
        return res.status(200).json({
            message: 'Tags updated successfully.',
            entry: updated,
        });
    }
    catch (err) {
        console.error('[Admin AddTags Error]', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.AddTags = AddTags;
// Admin Review- Get data of a user
const FetchReview = async (req, res) => {
    try {
        const idParam = req.query.id;
        if (!idParam || Array.isArray(idParam)) {
            return res.status(400).json({ error: 'Valid user ID is required in query' });
        }
        const id = parseInt(idParam, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'User ID must be a number' });
        }
        const result = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                roundTwo: {
                    select: {
                        taskAlloted: true,
                        taskLink: true,
                        status: true,
                        addOns: true,
                        tags: true,
                        createdAt: true,
                        review: {
                            select: {
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
                                forwarded: true, // IMPORTANT - Keep this
                                createdAt: true,
                            },
                        },
                    },
                },
            },
        });
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({
            message: 'Round2 full review data fetched successfully',
            result,
        });
    }
    catch (err) {
        console.error('[Admin Review Error]', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.FetchReview = FetchReview;
//Admin Review- update review
const UpdateReview = async (req, res) => {
    const { userId, reviewedBy, taskgiven, clubPrefer, subDomain, hs_place, reviews, remarks, rating, gd, general, forwarded, attendance, } = req.body;
    if (!userId || typeof userId !== 'number') {
        return res.status(400).json({ error: 'Valid userId is required' });
    }
    if (typeof attendance !== 'boolean') {
        return res.status(400).json({ error: 'Attendance (boolean) is required' });
    }
    try {
        const roundTwo = await prisma.roundTwo.findUnique({ where: { userId } });
        if (!roundTwo) {
            return res.status(404).json({ error: 'No RoundTwo task found for this user.' });
        }
        const existingReview = await prisma.roundTwoReview.findUnique({
            where: { roundTwoId: roundTwo.id },
        });
        if (existingReview) {
            const updated = await prisma.roundTwoReview.update({
                where: { roundTwoId: roundTwo.id },
                data: {
                    reviewedBy,
                    taskgiven,
                    clubPrefer,
                    subDomain,
                    hs_place,
                    reviews,
                    remarks,
                    rating,
                    gd,
                    general,
                    forwarded,
                    attendance,
                },
            });
            return res.status(200).json({
                message: 'Review updated successfully',
                review: updated,
            });
        }
        else {
            const created = await prisma.roundTwoReview.create({
                data: {
                    userId,
                    roundTwoId: roundTwo.id,
                    reviewedBy,
                    taskgiven,
                    clubPrefer,
                    subDomain,
                    hs_place,
                    reviews,
                    remarks,
                    rating,
                    gd,
                    general,
                    forwarded,
                    attendance,
                },
            });
            await prisma.roundTwo.update({
                where: { id: roundTwo.id },
                data: {
                    review: { connect: { id: created.id } },
                },
            });
            return res.status(201).json({
                message: 'Review created successfully',
                review: created,
            });
        }
    }
    catch (err) {
        console.error('[UpdateReview Error]', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.UpdateReview = UpdateReview;
