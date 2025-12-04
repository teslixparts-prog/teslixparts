"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function GuaranteePage() {
  const { lang } = useLanguage();

  const t =
    lang === "uk"
      ? {
          title: "Гарантія",
          text:
            "Ми надаємо 14-денну гарантію на всі б/в запчастини. Якщо деталь не відповідає опису, має приховані дефекти або не підходить за заявленими характеристиками — ви можете оформити повернення або обмін.",
        }
      : {
          title: "Гарантия",
          text:
            "Мы предоставляем 14-дневную гарантию на все б/у запчасти. Если деталь не соответствует описанию, имеет скрытые дефекты или не подходит по заявленным характеристикам — вы можете оформить возврат или обмен.",
        };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {t.title}
        </h1>
        <p className="mt-4 text-zinc-300">{t.text}</p>
      </div>
    </div>
  );
}
