import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';





export async function GET(request: Request) {
  try {
    const prisma = getPrismaClient();
    // Fetch the user's school from the request headers
  

    // Get the Prisma client for the user's school


    const { searchParams } = new URL(request.url);

    const className = searchParams.get('className');
    const subject = searchParams.get('subject');
    const trimester = searchParams.get('trimester');
    const teacherName = searchParams.get('teacherName');
    const teacherId = searchParams.get('teacherId');

    console.log('Received query parameters:', { className, subject, trimester, teacherName });

    // Validate if className, subject, and trimester are provided
    if (!className || !subject || !trimester || !teacherId) {
      console.error('Missing required query parameters');
      return NextResponse.json(
        { error: 'Missing required query parameters.' },
        { status: 400 }
      );
    }

    // Fetch students along with their report status for the specific teacher, subject, and trimester
    const students = await prisma.student.findMany({
      where: {
         // Filter students by the school
        class: {
          name: className,
        },
        marks: {
          some: {
            subject: {
              name: subject,
            },
            trimester: trimester,
          },
        },
      },
      include: {
        class: true,
        marks: true,
        reports: {
          where: {
            teacher: {
              id: teacherId ?? undefined,
            },
            subject: {
              name: subject,
            },
            trimester: trimester,
          },
        },
      },
    });

    // Transform students data to include a 'reportStatus' field based on whether the report exists
    const studentDataWithReports = students.map((student) => ({
      ...student,
      reportStatus: student.reports.length > 0 ? 'Done' : 'Not Yet',
    }));

    return NextResponse.json(studentDataWithReports, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students.' },
      { status: 500 }
    );
  }
}