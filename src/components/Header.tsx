"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { useLanguage } from "@/components/LanguageContext";

export default function Header() {
  const pathname = usePathname();
  const { totalCount } = useCart();
  const { lang, setLang } = useLanguage();

  const cartLabel = lang === "uk" ? "Кошик" : "Корзина";
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: lang === "uk" ? "Головна" : "Главная" },
    { href: "/catalog", label: lang === "uk" ? "Каталог" : "Каталог" },
    {
      href: "/cars",
      label: lang === "uk" ? "Авто під розбір" : "Авто под разбор",
    },
    { href: "/delivery", label: lang === "uk" ? "Доставка" : "Доставка" },
    { href: "/payment", label: lang === "uk" ? "Оплата" : "Оплата" },
    { href: "/guarantee", label: lang === "uk" ? "Гарантія" : "Гарантия" },
    { href: "/selection", label: lang === "uk" ? "Підбір запчастин" : "Подбор запчастей" },
    { href: "/contacts", label: lang === "uk" ? "Контакти" : "Контакты" },
  ];

  return (
    <header className="border-b border-zinc-800/40 bg-zinc-950 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo1.PNG" alt="TESLIX" width={40} height={40} />
          <span className="text-sm font-bold tracking-tight text-white">TESLIX PARTS</span>
        </Link>
        <nav className="hidden gap-4 text-sm text-zinc-300 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                "underline-offset-4 transition hover:-translate-y-[1px] hover:text-white hover:underline " +
                (pathname === item.href ? "text-white font-semibold" : "text-zinc-300")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-zinc-700 bg-black/40 p-1 text-[11px] text-zinc-300 sm:flex">
            <button
              type="button"
              onClick={() => setLang("ru")}
              className={`rounded-full px-2 py-0.5 ${
                lang === "ru" ? "bg-pink-200 text-black" : "bg-transparent text-zinc-300 hover:text-white"
              }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLang("uk")}
              className={`rounded-full px-2 py-0.5 ${
                lang === "uk" ? "bg-pink-200 text-black" : "bg-transparent text-zinc-300 hover:text-white"
              }`}
            >
              UA
            </button>
          </div>
          {/* Mobile language toggle */}
          <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-black/40 p-1 text-[10px] text-zinc-300 sm:hidden">
            <button
              type="button"
              onClick={() => setLang("ru")}
              className={`rounded-full px-2 py-0.5 ${
                lang === "ru" ? "bg-pink-200 text-black" : "bg-transparent text-zinc-300 hover:text-white"
              }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLang("uk")}
              className={`rounded-full px-2 py-0.5 ${
                lang === "uk" ? "bg-pink-200 text-black" : "bg-transparent text-zinc-300 hover:text-white"
              }`}
            >
              UA
            </button>
          </div>
          <Link
            href="/cart"
            className="relative hidden items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-900 sm:flex"
          >
            <span>{cartLabel}</span>
            <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-pink-200 px-2 text-xs font-semibold text-black shadow-md shadow-pink-300/40">
              {totalCount}
            </span>
          </Link>
          {/* Mobile cart pill, always visible */}
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-900 sm:hidden"
          >
            <span>{cartLabel}</span>
            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-pink-200 px-1.5 text-[10px] font-semibold text-black shadow-md shadow-pink-300/40">
              {totalCount}
            </span>
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-900 sm:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Меню</span>
            <span className="flex flex-col gap-[3px]">
              <span className={`h-[2px] w-5 bg-zinc-200 transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`h-[2px] w-5 bg-zinc-200 transition ${open ? "opacity-0" : ""}`} />
              <span className={`h-[2px] w-5 bg-zinc-200 transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-zinc-800/40 bg-zinc-950 px-6 py-3 text-sm text-zinc-200 sm:hidden">
          <nav className="flex flex-col gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  "py-1 underline-offset-4 transition hover:text-white hover:underline " +
                  (pathname === item.href ? "text-white font-semibold" : "text-zinc-300")
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex items-center justify-between rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              <span>{cartLabel}</span>
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-pink-200 px-2 text-xs font-semibold text-black shadow-md shadow-pink-300/40">
                {totalCount}
              </span>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
