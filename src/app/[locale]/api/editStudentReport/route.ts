import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, report, className, subject, trimester, teacherName } = body;

    // Input validation
    if (!studentId || !report || !className || !subject || !trimester || !teacherName) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Fetch student
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ message: 'Student not found.' }, { status: 404 });
    }

    // Fetch teacher
    const teacher = await prisma.teacher.findFirst({ where: { name: teacherName } });
    if (!teacher) {
      return NextResponse.json({ message: 'Teacher not found.' }, { status: 404 });
    }

    // Fetch class
    const relatedClass = await prisma.class.findFirst({ where: { name: className } });
    if (!relatedClass) {
      return NextResponse.json({ message: 'Class not found.' }, { status: 404 });
    }

    // Fetch subject
    const relatedSubject = await prisma.subject.findFirst({ where: { name: subject } });
    if (!relatedSubject) {
      return NextResponse.json({ message: 'Subject not found.' }, { status: 404 });
    }

    // Check if a report exists for this student, teacher, subject, and trimester
    const existingReport = await prisma.studentReport.findFirst({
      where: {
        studentId: studentId,
        subjectId: relatedSubject.id,
        teacherId: teacher.id,
        trimester: trimester,
      },
    });

    if (!existingReport) {
      return NextResponse.json({ message: 'Report not found for this student, subject, teacher, and trimester.' }, { status: 404 });
    }

    // Extract updated report data and marks
    const { presentStatus, recommendations, comment, quizMark, projectMark } = report;

    // Update the student report
    const updatedReport = await prisma.studentReport.update({
      where: {
        id: existingReport.id,  // Update the existing report by ID
      },
      data: {
        status: presentStatus || existingReport.status,
        recommendations: recommendations || existingReport.recommendations,
        comment: comment || existingReport.comment,
        quizScore: quizMark ? parseInt(quizMark) : existingReport.quizScore,
        projectScore: projectMark ? parseInt(projectMark) : existingReport.projectScore,
      },
    });

    return NextResponse.json({ message: 'Report updated successfully.', report: updatedReport }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating report:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
