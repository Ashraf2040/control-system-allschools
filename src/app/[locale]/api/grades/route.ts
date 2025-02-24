import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '@/lib/prisma';

// const prisma = new PrismaClient();

export async function GET() {
   const prisma = getPrismaClient()
  try {
    // Fetch unique grades from the Class model
    const grades = await prisma.class.findMany({
      select: {
        grade: true,
      },
      distinct: ['grade'], // Ensure only unique grades are returned
    });

    // Extract the grade values from the result
    const uniqueGrades = grades.map((classItem) => classItem.grade);

    return NextResponse.json(uniqueGrades, { status: 200 });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { message: 'Failed to fetch grades' },
      { status: 500 }
    );
  }
}