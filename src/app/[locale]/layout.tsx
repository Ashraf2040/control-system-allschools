import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./_components/Header";
import ReduxProvider from "@/redux/ReduxProvider";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string }; // Ensure locale is defined as a required string
}) {
  const { locale  } =await params;

  let messages;
  try {
    messages = await getMessages(locale);
  } catch (error) {
    console.error(`[Error] Unable to fetch messages for locale: ${locale}`, error);
    messages = {}; // Fallback to empty messages
  }

  return (
    <ReduxProvider>
      <ClerkProvider>
        <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
          <body className="text-gray-900 bg-[#fafafa]">
            <NextIntlClientProvider messages={messages} locale={locale}>
              <Header locale={locale} />
              <main>{children}</main>
              <ToastContainer />
            </NextIntlClientProvider>
          </body>
        </html>
      </ClerkProvider>
    </ReduxProvider>
  );
}
