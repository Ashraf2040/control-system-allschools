import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
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

    // Check if a report already exists for this student, teacher, subject, trimester
    const existingReport = await prisma.studentReport.findFirst({
      where: {
        studentId: studentId,
        subjectId: relatedSubject.id,
        teacherId: teacher.id,
        trimester: trimester,
      },
    });

    if (existingReport) {
      return NextResponse.json({ message: 'Report already exists for this student, subject, teacher, and trimester.' }, { status: 400 });
    }

    // Extract report data and marks
    const { presentStatus, recommendations, comment, quizMark, projectMark } = report;

    // Save the student report, including quizMark and projectMark
    const savedReport = await prisma.studentReport.create({
      data: {
        studentId,
        classId: relatedClass.id,
        teacherId: teacher.id,
        subjectId: relatedSubject.id,
        academicYear: teacher.academicYear, // Assuming the teacher's academic year applies
        trimester,
        status: presentStatus || 'Not Started',  // Default to 'Not Started' if missing
        recommendations: recommendations || [],   // Default to empty array if missing
        comment: comment || '',                   // Default to empty string if missing
        quizScore: quizMark ? parseInt(quizMark) : null,  // Convert to integer if provided
        projectScore: projectMark ? parseInt(projectMark) : null, // Convert to integer if provided
      },
    });

    return NextResponse.json({ message: 'Report saved successfully.', report: savedReport }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving report:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}