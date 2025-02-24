import { getPrismaClient } from '@/lib/prisma';
import { get } from 'http';
import { NextResponse } from 'next/server';

// Handle GET requests


export async function GET() {
  const prisma = getPrismaClient()
  try {

   
    const settings = await prisma.globalSettings.findFirst();
    console.log("Settings fetched:", settings);
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: 'Failed to fetch target date.' }, { status: 500 });
  }
}

// Handle POST requests
export async function POST(req: Request) {

  try {
    const prisma = getPrismaClient()
    const body = await req.json();
    const { targetDate } = body;

    if (!targetDate) {
      return NextResponse.json({ error: 'Target date is required.' }, { status: 400 });
    }

    // Delete all existing rows in the globalSettings table
    await prisma.globalSettings.deleteMany({});

    // Upsert the new global settings row with the provided target date
    const settings = await prisma.globalSettings.upsert({
      where: { id: 'global-settings' }, // Fixed ID for a single global settings row
      create: { id: 'global-settings', targetDate: new Date(targetDate) },
      update: { targetDate: new Date(targetDate) },
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: 'Failed to update target date.' }, { status: 500 });
  }
}

