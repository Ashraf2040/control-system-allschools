// app/api/classes/route.ts
import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  try {
    const prisma = getPrismaClient();
    const url = new URL(request.url);
    const grade = url.searchParams.get('grade');

    const classes = await prisma.class.findMany({
      where: {
        grade: grade || undefined,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'An error occurred while fetching classes.' }, { status: 500 });
  }
}