

import { NextResponse } from 'next/server';
import { getClassesByTeacher, getClassesByTeacherAdmin } from '@/lib/actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId');
  const subjectId = searchParams.get('subjectId');
console.log(subjectId)
  if (!teacherId) {
    return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
  }

  if (!subjectId) {
    return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
  }

  try {
    // Assuming getClassesByTeacher is capable of filtering by both teacherId and subjectId
    const classes = await getClassesByTeacherAdmin(teacherId, subjectId);
    return NextResponse.json(classes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
