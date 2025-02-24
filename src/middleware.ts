import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware, clerkClient } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});

const protectedRoutes = {
  TEACHER: ['/admin', '/class-subjects', '/teacherProgress', '/teacherCreation', '/studentsManage'],
};

export default clerkMiddleware(async (auth, req) => {
  console.log("Middleware started for:", req.nextUrl.pathname);

  try {
    const session = auth();
    if (!session || !session.userId) {
      console.log("No user session. Redirecting to sign in.");
      return NextResponse.redirect(new URL('https://central-chimp-3.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fen', req.url));
    }

    const user = await clerkClient().users.getUser(session.userId);
    if (!user) {
      console.log("User not found in Clerk.");
      return NextResponse.redirect(new URL('/error', req.url));
    }

    const userRole = user.publicMetadata.role;
    const userSchool = user.publicMetadata.school || 'default';

    console.log(`User Role: ${userRole}, User School: ${userSchool}`);

    const response = NextResponse.next();
    response.cookies.set({
      name: 'x-school',
      value: userSchool.toString(),
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    console.log("Set x-school cookie:", response.cookies.get('x-school')?.value);

    const pathname = req.nextUrl.pathname;
    if (userRole === 'TEACHER' && protectedRoutes.TEACHER.includes(pathname)) {
      console.log("Teacher accessing protected route. Redirecting to /unauthorized.");
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    const intlResponse = intlMiddleware(req);
    if (intlResponse) {
      console.log("Internationalization middleware handled the request.");
      intlResponse.cookies.set({
        name: 'x-school',
        value: userSchool.toString(),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });
      console.log("Intl response cookie set:", intlResponse.cookies.get('x-school')?.value);
      return intlResponse;
    }

    console.log("Middleware completed successfully.");
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/error', req.url));
  }
});

export const config = {
  matcher: [
    '/',
    '/(ar|en)/:path*',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};