import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET() {
   const prisma = getPrismaClient()
  try {
    const classes = await prisma.class.findMany({
      select: { id: true, name: true },
    });
    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Error fetching classes.' },
      { status: 500 }
    );
  }
}
