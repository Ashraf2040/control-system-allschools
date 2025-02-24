import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function PUT(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { id, name, arabicName, classId, nationality, dateOfBirth, iqamaNo, passportNo, expenses } = body;

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        arabicName,
        classId,
        nationality,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        iqamaNo,
        passportNo,
        expenses,
      },
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Error updating student.' },
      { status: 500 }
    );
  }
}
