"use client";

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import { HiOutlineUserGroup } from "react-icons/hi";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

const COLORS_TOP = ["#f95959"];

const Header = ({ locale }: { locale: string }) => {
  const color = useMotionValue(COLORS_TOP[0]);
  const pathName = usePathname();

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const router = useRouter();
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  const isHomePage = pathName === `/${locale}`;
  const isTeacherPage = pathName === `/${locale}/teacher`;
  const isStudentPage = pathName.includes("studentsProgress");

  // Add the grid background conditionally
  const headerBackground = isHomePage
    ? {
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='%2318181b'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")  `,
        backgroundColor: "rgb(9 9 11)", // bg-zinc-950
        
      }
    : { backgroundColor: "rgb(24 24 27)" }; // bg-main

  const t = useTranslations("admin");

  return (
    <header
      className={`w-full h-20 py-2 px-4 md:px-8 lg:px-12 flex justify-between items-center print:hidden  `}
      style={headerBackground} // Apply the conditional background
    >
      <Link href="/" className={` ${isHomePage ? "p-1 ring-2 ring-[#f95959] rounded-full" :" "}`}>
        <Image
          src="/forqan.jpg"
          alt="Logo"
          width={800}
          height={800}
          className="w-12 h-12 rounded-full"
        />
      </Link>

      <div
        className={`${
          isHomePage || isTeacherPage || isStudentPage
            ? "hidden"
            : "gap-3 h-full hidden lg:flex"
        }`}
      >
        <button
          onClick={() => handleNavigation("/teacherCreation")}
          className="px-4 h-full py-2 font-semibold hover:scale-110 transition-all duration-500 cursor-pointer bg-third rounded-md hover:bg-second flex items-center gap-2 hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
            />
          </svg>
          {t("Create Teacher")}
        </button>
        <button
          onClick={() => handleNavigation("/teacherProgress")}
          className="px-4 py-2 font-semibold hover:scale-110 flex items-center gap-2 hover:bg-second hover:text-black transition-all duration-500 cursor-pointer bg-third rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
            />
          </svg>
          {t("Teacher Management")}
        </button>
        <button
          onClick={() => handleNavigation("/studentsManage")}
          className="px-4 py-2 font-semibold hover:scale-110 flex items-center gap-2 transition-all duration-500 cursor-pointer bg-third rounded-md hover:bg-second hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
            />
          </svg>
          {t("Student Management")}
        </button>
        <button
          onClick={() => handleNavigation("/class-subjects")}
          className="px-4 py-2 font-semibold hover:scale-110 flex items-center gap-2 transition-all duration-500 cursor-pointer bg-third rounded-md hover:bg-second hover:text-black"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
            />
          </svg>
          {t("Class Subjects Management")}
        </button>
      </div>

      <div className="text-end flex gap-8 items-center">
        <div
          className={`cursor-pointer ${isHomePage ? "hidden" : ""}`}
          onClick={() => handleNavigation("/")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-white font-semibold"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </div>

        <SignedOut>
          <SignInButton>
            <motion.button
              style={{
                border,
                boxShadow,
              }}
              whileHover={{
                scale: 1.015,
              }}
              whileTap={{
                scale: 0.985,
              }}
              className={`${
                isHomePage ? "bg-transparent" : ""
              } group relative flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50`}
            >
              {locale === "en" ? "Sign In" : "تسجيل الدخول"}
            </motion.button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <LanguageSwitcher locale={locale} />
      </div>
    </header>
  );
};

export default Header;