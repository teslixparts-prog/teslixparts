"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function PaymentPage() {
  const { lang } = useLanguage();

  const t =
    lang === "uk"
      ? {
          title: "Оплата",
          p1:
            "Після оформлення замовлення на ваш e‑mail автоматично буде відправлено інвойс на оплату. У ньому будуть вказані всі деталі по замовленню та реквізити для оплати.",
          p2:
            "Оплату необхідно здійснити за реквізитами, вказаними у рахунку, протягом 24 годин. Після підтвердження оплати ми приступимо до обробки та відправки вашого замовлення.",
        }
      : {
          title: "Оплата",
          p1:
            "После оформления заказа на ваш e‑mail автоматически будет отправлен инвойс на оплату. В нём будут указаны все детали по заказу и реквизиты для оплаты.",
          p2:
            "Оплату необходимо произвести по реквизитам, указанным в счёте, в течение 24 часов. После подтверждения оплаты мы приступим к обработке и отправке вашего заказа.",
        };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {t.title}
        </h1>
        <div className="mt-4 space-y-4 text-zinc-300">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
        </div>

        {/** Раздел гарантии перемещён на отдельную страницу /guarantee */}
      </div>
    </div>
  );
}
