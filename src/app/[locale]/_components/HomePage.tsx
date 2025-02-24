"use client";
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useTranslations } from "next-intl";
import { Hero } from './Hero';
import Footer from './Footer';


export default function HomePage() {
  const { isLoaded, userId } = useAuth(); 
  const { user } = useUser();
  const router = useRouter();
  
  // Get the role and handle routing
  let role: string | undefined;
  useEffect(() => {
    if (isLoaded && userId) {
      role = user?.publicMetadata?.role as string | undefined;
      if (role === 'ADMIN') {
        router.push('/admin');
      } else if (role === 'TEACHER') {
        router.push(`/teacher`);
      } else if (role === 'STUDENT') {
        router.push(`/studentCertificate/${userId}`);
      }
    }
  }, [isLoaded, userId, user, router]);

  if (!isLoaded) return <p>Loading...</p>;

  // Get translations for HomePage
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col items-center text-white w-full h-full relative">
      <Hero />
      <div className='absolute md:right-0 bottom-0'>
        <div className="text-3xl font-bold mt-20">{t("title")}</div>
        <Footer />
      </div>
    </div>
  );
}
