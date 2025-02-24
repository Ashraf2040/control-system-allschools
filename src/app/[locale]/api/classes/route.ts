// app/api/classes/route.ts

import { NextResponse } from 'next/server';
import { getClassesByTeacher } from '@/lib/actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get('teacherId');
console.log(teacherId)
  if (!teacherId) {
    return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
  }

  try {
    const classes = await getClassesByTeacher((teacherId));
    return NextResponse.json(classes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
