import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import { LanguageProvider } from "@/components/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeslixParts — Запчасти для Tesla",
  description: "Каталог запчастей для Tesla (Model 3/Y/X/S). Доставка из Польши в Украину своим перевозчиком. Оплата по реквизитам.",
};

function Analytics({ id }: { id: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!(window as any).gtag) return;
    (window as any).gtag("config", id, { page_path: pathname });
    (window as any).gtag("event", "page_view", { send_to: id });
  }, [id, pathname]);
  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-17782747987";
  return (
    <html lang="ru">
      <head>
        <Script id="gtag-base" src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`} strategy="beforeInteractive" />
        <Script id="gtag-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${adsId}');
            gtag('event', 'page_view', { send_to: '${adsId}' });
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          <LanguageProvider>
            <WelcomeOverlay />
            <div className="flex min-h-screen flex-col text-zinc-50">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Analytics id={adsId} />
              <footer className="border-t border-zinc-700 bg-black/50 px-4 py-4 text-center text-xs text-zinc-500 shadow-[0_-4px_12px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-4">
                <span>
                  Контакты: <a href="tel:+380684812802" className="underline">+380684812802</a>
                </span>
                <span>
                  E-mail: <a href="mailto:teslixparts@gmail.com" className="underline">teslixparts@gmail.com</a>
                </span>
                <span className="flex items-center gap-2">
                  <a
                    href="https://wa.me/message/K4IETZDOGSNIF1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="messenger-link inline-flex items-center gap-2 hover:text-zinc-200"
                  >
                    <span className="flex items-center justify-center rounded-full bg-zinc-900/70 p-1">
                      <Image src="/icons/whatsapp.svg" alt="WhatsApp" width={16} height={16} />
                    </span>
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="https://t.me/teslixparts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="messenger-link inline-flex items-center gap-2 hover:text-zinc-200"
                  >
                    <span className="flex items-center justify-center rounded-full bg-zinc-900/70 p-1">
                      <Image src="/icons/telegram.svg" alt="Telegram" width={16} height={16} />
                    </span>
                    <span>Telegram</span>
                  </a>
                </span>
                </div>
                <div className="mt-2 space-y-1 text-[10px] text-zinc-600">
                  <div>Наш адрес: Okólna 45b/Rampa nr 27, 05-260 Marki, Polska</div>
                  <div>Графік роботи: Пн-Сб 9:00 - 18:00</div>
                </div>
              </footer>
            </div>
          </LanguageProvider>
        </CartProvider>
      </body>
    </html>
  );
}
