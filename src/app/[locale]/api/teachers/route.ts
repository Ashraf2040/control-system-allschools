import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';
// import { prisma } from '../../../../../src/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const subjectId = url.searchParams.get('subjectId');
    const teacherId = url.searchParams.get('teacherId');
    const prisma = getPrismaClient();

    if (subjectId) {
      // Fetch teachers associated with the given subjectId
      const teachers = await prisma.teacher.findMany({
        where: {
          subjects: {
            some: {
              subjectId: subjectId,
            },
          },
        },
        include: {
          subjects: {
            include: {
              subject: true, // Include the actual subject name
            },
          },
          classes: {
            include: {
              class: true, // Include the actual class name
            },
          },
        },
      });

      return NextResponse.json(teachers);
    } else if (teacherId) {
      // Fetch specific teacher data by teacherId
      const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
          subjects: {
            include: {
              subject: true, // Include subject names
            },
          },
          classes: {
            include: {
              class: true, // Include class names
            },
          },
        },
      });

      if (!teacher) {
        return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
      }

      return NextResponse.json(teacher); // Return teacher with related subjects and classes
    } else {
      return NextResponse.json({ message: 'Bad Request' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
