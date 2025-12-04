"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function ContactsPage() {
  const { lang } = useLanguage();

  const t =
    lang === "uk"
      ? {
          title: "Контакти",
          contactSection: "Зв'язатися з нами",
          phoneLabel: "Телефон:",
          emailLabel: "E-mail:",
          addressSection: "Наша адреса",
          warehouseNote:
            "Склад запчастин і зона відвантаження. Відвідування за попередньою домовленістю.",
          mapLink: "Відкрити в Google Maps",
        }
      : {
          title: "Контакты",
          contactSection: "Связаться с нами",
          phoneLabel: "Телефон:",
          emailLabel: "E-mail:",
          addressSection: "Наш адрес",
          warehouseNote:
            "Склад запчастей и зона отгрузки. Посещение по предварительному согласованию.",
          mapLink: "Открыть в Google Maps",
        };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {t.title}
        </h1>

        <section className="rounded-xl border border-zinc-700 bg-black/40 p-4 text-sm text-zinc-200 shadow-sm shadow-black/40">
          <h2 className="text-lg font-semibold">{t.contactSection}</h2>
          <p className="mt-3">
            {t.phoneLabel} <a href="tel:+380684812802" className="underline">+380684812802</a>
          </p>
          <p className="mt-1">
            {t.emailLabel} <a href="mailto:teslixparts@gmail.com" className="underline">teslixparts@gmail.com</a>
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <a
              href="https://wa.me/message/K4IETZDOGSNIF1"
              target="_blank"
              rel="noopener noreferrer"
              className="messenger-link inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 hover:bg-zinc-900"
            >
              <span className="flex items-center justify-center rounded-full bg-zinc-900/70 p-1">
                <img src="/icons/whatsapp.svg" alt="WhatsApp" className="h-4 w-4" />
              </span>
              <span>WhatsApp</span>
            </a>
            <a
              href="https://t.me/teslixparts"
              target="_blank"
              rel="noopener noreferrer"
              className="messenger-link inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 hover:bg-zinc-900"
            >
              <span className="flex items-center justify-center rounded-full bg-zinc-900/70 p-1">
                <img src="/icons/telegram.svg" alt="Telegram" className="h-4 w-4" />
              </span>
              <span>Telegram</span>
            </a>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-700 bg-black/40 p-4 text-sm text-zinc-200 shadow-sm shadow-black/40">
          <h2 className="text-lg font-semibold">{t.addressSection}</h2>
          <p className="mt-2">Okólna 45b/Rampa nr 27, 05-260 Marki, Polska</p>
          <p className="mt-2 text-xs text-zinc-400">
            {t.warehouseNote}
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Ok%C3%B3lna+45b%2FRampa+nr+27%2C+05-260+Marki%2C+Polska"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs text-sky-400 underline hover:text-sky-300"
          >
            {t.mapLink}
          </a>
        </section>
      </div>
    </div>
  );
}
