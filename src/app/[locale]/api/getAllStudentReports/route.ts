import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || ''; // Optional: filter by name

  try {
    const prisma = getPrismaClient();
    // Fetch all students, including their associated reports
    const students = await prisma.student.findMany({
      where: {
        name: {
          contains: name, // Case-insensitive search
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        arabicName: true,
        iqamaNo: true,
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        reports: {
          select: {
            id: true,
            academicYear: true,
            trimester: true,
            status: true,
            recommendations: true,
            comment: true,
            quizScore: true,
            projectScore: true,
            teacher: {
              select: {
                id: true,
                name: true,
                arabicName: true,
                signature: true,
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching student data.' },
      { status: 500 }
    );
  }
}
