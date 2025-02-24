import { getPrismaClient } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const { subjectId, grade, headers, maxValues } = await req.json();

    // Basic input validation
    if (!subjectId || !grade || !headers || !maxValues) {
      return NextResponse.json(
        { error: 'Missing required fields: subjectId, grade, headers, or maxValues' },
        { status: 400 }
      );
    }

    const config = await prisma.markHeaderConfig.upsert({
      where: { subjectId_grade: { subjectId, grade } }, // grade is already a string from the form
      update: { headers, maxValues },
      create: { subjectId, grade, headers, maxValues },
    });

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/mark-header-config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const grade = searchParams.get('grade');

    if (!subjectId || !grade) {
      return NextResponse.json({ error: 'Missing subjectId or grade' }, { status: 400 });
    }

    const config = await prisma.markHeaderConfig.findUnique({
      where: { subjectId_grade: { subjectId, grade } },
    });

    if (!config) {
      return NextResponse.json({ message: 'No config found' }, { status: 404 });
    }

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/mark-header-config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration', details: error.message },
      { status: 500 }
    );
  }
}