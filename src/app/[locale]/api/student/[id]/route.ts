import { getStudentWithMarks } from '@/lib/actions';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const studentId = params.id;
    const studentData = await getStudentWithMarks(studentId);

    if (!studentData) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(studentData, { status: 200 });
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json({ error: 'Failed to fetch student data' }, { status: 500 });
  }
}