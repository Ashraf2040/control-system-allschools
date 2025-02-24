import { NextResponse } from 'next/server';
import { getPrismaClient} from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  // const teacherId = searchParams.get('teacherId');
  const role = searchParams.get('role');
  const subjectId = searchParams.get('subjectId') || undefined; // Default to "2" if not provided
  const academicYear = searchParams.get('academicYear') || undefined;
  const trimester = searchParams.get('trimester') || undefined;

  if (!classId ) {
    return new Response('Missing classId ', { status: 400 });
  }

  try {
    console.log(trimester,academicYear,subjectId,classId)
    const prisma = getPrismaClient();
    const studentsWithMarks = await prisma.student.findMany({
      where: {
        classId,
        marks: {
          some: {
            subjectId,
            academicYear,
            trimester,
            // ClassSubject: {
            //   teacherId: role === 'admin' ? undefined : teacherId,
            // },
          },
        },
      },
      include: {
        marks: {
          where: {
            subjectId,
            academicYear,
            trimester,
          },
        },
      },
    });

    return new Response(JSON.stringify(studentsWithMarks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to fetch students', { status: 500 });
  }
}
