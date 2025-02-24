// src/app/api/classes/route.ts

import { getPrismaClient } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET() {
   const prisma = getPrismaClient()
  try {
    const classes = await prisma.class.findMany();
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
