import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// USER SIDE
//Create or Update Round 2 Entry
export const CreateUpdateTask = async (req: Request, res: Response): Promise<Response> => {
  (req as any).user = { id: 1 };
    const { taskAlloted, taskLink, addOns, status, panel } = req.body;
  const user = req.user as { id: number };

  if (!taskAlloted || !taskLink || !status || !Array.isArray(addOns)) {
    return res.status(400).json({ error: 'Missing or invalid required fields' });
  }

  try {
    const existingEntry = await prisma.roundTwo.findUnique({
      where: { userId: user.id },
    });

    if (existingEntry) {
      const updatedEntry = await prisma.roundTwo.update({
        where: { userId: user.id },
        data: {
          taskAlloted,
          taskLink,
          status,
          addOns,
          panel,
        },
      });

      return res.status(200).json({ message: 'saved successfully', entry: updatedEntry });
    } else {
      const newEntry = await prisma.roundTwo.create({
        data: {
          panel,
          taskAlloted,
          taskLink,
          status,
          addOns,
          tags: [],
          user: { connect: { id: user.id } },
        },
      });

      return res.status(201).json({ message: 'saved successfully', entry: newEntry });
    }
  } catch (err) {
    console.error('[Round2 Error]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



// ADMIN SIDE
// Fetch All Users in Round 2
export const FetchUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const candidates = await prisma.user.findMany({
      where: { role: Role.USER },
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
  } catch (err) {
    console.error('[Round2 Fetch Error]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Add Tags to a User
export const AddTags = async (req: Request, res: Response): Promise<Response> => {
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
  } catch (err) {
    console.error('[Admin AddTags Error]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Admin Review- Get data of a user
export const FetchReview = async (req: Request, res: Response): Promise<Response> => {
  try {
const idParam = req.query.id;

if (!idParam || Array.isArray(idParam)) {
  return res.status(400).json({ error: 'Valid user ID is required in query' });
}

const id = parseInt(idParam as string, 10); // ✅ safely cast to string

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
                forwarded: true,
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
  } catch (err) {
    console.error('[Admin Review Error]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
//Admin Review- update review
export const UpdateReview = async (req: Request, res: Response): Promise<Response> => {
  const {
    userId,
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
  } = req.body;

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
    } else {
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
  } catch (err) {
    console.error('[UpdateReview Error]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
