import { PrismaClient } from '@prisma/client';

export const getPrismaClient = (schoolId: string): PrismaClient => {
  let prismaClient;

  switch (schoolId) {
    case 'school_1':
      prismaClient = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_SCHOOL_1 } } });
      break;
    case 'school_2':
      prismaClient = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_SCHOOL_2 } } });
      break;
    case 'school_3':
      prismaClient = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_SCHOOL_3 } } });
      break;
    default:
      throw new Error('Invalid school ID');
  }

  return prismaClient;
};
