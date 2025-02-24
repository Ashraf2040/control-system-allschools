import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  try {
 const prisma = getPrismaClient();
    const url = new URL(request.url);
    const trimester = url.searchParams.get('trimester');
    const grade = url.searchParams.get('grade');
    const classId = url.searchParams.get('classId');

    const students = await prisma.student.findMany({
      where: {
        classId: classId || undefined, // If classId is not provided, fetch all students in the grade
        class: {
          grade: grade || undefined,
        },
        marks: {
          some: {
            trimester: trimester || undefined,
          },
        },
      },
      include: {
        marks: {
          include: {
            subject: true
          },
        },
      },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json({ error: 'An error occurred while fetching student data.' }, { status: 500 });
  }
}