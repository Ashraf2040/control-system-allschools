"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Grid } from "./_components/Grid";



export default function HomePage() {
  const { isLoaded, userId} = useAuth();
  const { user } = useUser();
  const router = useRouter();





  useEffect(() => {

    console.log(user)
    if (isLoaded && userId) {
      const role = user?.publicMetadata?.role as string | undefined;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "TEACHER") {
        router.push(`/teacher`);
      } else if (role === "STUDENT") {
        router.push(`/studentCertificate/${user?.externalId}`);
      }
    }
  }, [isLoaded, userId, user, router]);

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div
      className="flex flex-col items-center text-white w-full h-full relative bg-zinc-950" // Add bg-zinc-950 here
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='%2318181b'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      }}
    >
      {/* <Hero2 /> */}
      <Grid />
      <div className="absolute md:right-0 bottom-0">
        {/* <Footer /> */}
      </div>
    </div>
  );
}