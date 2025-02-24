import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || ''; // Optional: filter by name
  const classId = url.searchParams.get('classId') || ''; // Optional: filter by classId

  try {
    const prisma = getPrismaClient();
    const students = await prisma.student.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' }, // Filter by name (case-insensitive)
        ...(classId && { classId }), // Filter by classId if provided
      },
      select: {
        id: true,
        name: true,
        arabicName: true,
        classId: true,
        nationality: true,
        dateOfBirth: true,
        iqamaNo: true,
        passportNo: true,
        expenses: true,
      },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Error fetching students.' },
      { status: 500 }
    );
  }
}
