import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const databaseMap: Record<string, string> = {
  forqan: process.env.DATABASE_URL!,
  batool: process.env.DATABASE_URL_batool1!,
  batool2: process.env.DATABASE_URL_batool2!,
  faihaa: process.env.DATABASE_URL_faihaa!,
};

export function getPrismaClient(): PrismaClient {
  const cookieStore = cookies();
  const schoolCookie = cookieStore.get('x-school');
  console.log("All cookies:", Array.from(cookieStore.getAll()).map(c => `${c.name}=${c.value}`));
  console.log("x-school cookie:", schoolCookie);
  const school = schoolCookie?.value || 'forqan';
  console.log("The school returned from cookies:", school);

  const databaseUrl = databaseMap[school] || databaseMap['forqan'];

  return new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
  });
}