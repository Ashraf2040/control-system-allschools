import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  const { studentId } = params;

  try {
    const prisma = getPrismaClient();
    // Fetch all reports for the specific student
    const studentReports = await prisma.studentReport.findMany({
      where: { studentId },
      select: {
        academicYear: true,
        trimester: true,
        status: true,             // Fetch status
        recommendations: true,    // Fetch recommendations (array of strings)
        comment: true, 
        quizScore: true,
        projectScore: true,           // Fetch comment
        createdAt: true,          // Fetch the creation date of the report
        student: {
          select: {
            name: true,           // Fetch student name
          },
        },
        subject: {
          select: {
            name: true,   
            arabicName: true        // Fetch subject name
          },
        },
        teacher: {
          select: {
            name: true,  
            signature: true,
            arabicName: true         // Fetch teacher name
          },
        },
        class: {
          select: {
            name: true,           // Fetch class name
          },
        },
      },
    });

    if (studentReports.length === 0) {
      return NextResponse.json(
        { message: 'No reports found for this student.' },
        { status: 404 }
      );
    }

    // Format the response data to include the student's name and the date the report was received
    const formattedReports = studentReports.map(report => ({
      ...report,
      studentName: report.student.name,
      dateReceived: report.createdAt.toISOString(), // Convert the date to ISO string
    }));

    return NextResponse.json(formattedReports, { status: 200 });
  } catch (error) {
    console.error('Error fetching student reports:', error);
    return NextResponse.json(
      { error: 'Error fetching student reports.' },
      { status: 500 }
    );
  }
}
