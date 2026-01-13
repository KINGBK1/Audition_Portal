import { PrismaClient } from "@prisma/client";

// Pass the DATABASE_URL via the 'datasources' option
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
