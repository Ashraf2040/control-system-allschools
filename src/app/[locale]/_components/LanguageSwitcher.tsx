"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";

const LanguageSwitcher = () => {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    const newPath = `/${newLocale}${pathname.replace(`/${locale}`, "")}`;
    router.push(newPath);
  };

  const isHomePage = pathname === `/${locale}`; // Check if on the home page
  const headerBackground = isHomePage ? "bg-transparent text-white" : "bg-main";

  return (
    <motion.button
      onClick={() => switchLanguage(locale === "en" ? "ar" : "en")}
      className={`flex items-center p-1 justify-center rounded-full border text-white shadow-md transition-all w-8 h-8 focus:outline-none ${headerBackground} focus:ring-2`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {locale === "en" ? "Ar" : "En"}
    </motion.button>
  );
};

export default LanguageSwitcher;
