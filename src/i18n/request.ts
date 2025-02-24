import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ["en", "ar"];

export default getRequestConfig(async ({ locale }) => {
  // Validate the locale
  if (!locales.includes(locale)) notFound();

  // Load the messages for the locale
  return {
    messages: (await import(`./../messages/${locale}.json`)).default,
  };
});
