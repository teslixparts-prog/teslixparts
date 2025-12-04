"use client";

import { useLanguage } from "@/components/LanguageContext";

export default function DeliveryPage() {
  const { lang } = useLanguage();

  const t =
    lang === "uk"
      ? {
          title: "Доставка",
          intro:
            "Наш основний склад запчастин знаходиться в Польщі. Логістика здійснюється власним перевізником за маршрутом Польща → Львів → Київ.",
          methodsTitle: "Способи отримання замовлення",
          selfPickup:
            "Самовивіз у Львові або Києві — після прибуття вантажу в один з міст ми повідомимо вам час та адресу видачі.",
          ukrDelivery:
            "Доставка по Україні — відправляємо товар з Києва на відділення або адресу «Нової пошти».",
          priceText:
            "Вартість доставки вже включена в ціну запчастин, вказану на сайті. Додаткових платежів за доставку немає.",
          timeText: "Термін доставки після оформлення замовлення: від 2 до 5 днів.",
        }
      : {
          title: "Доставка",
          intro:
            "Наш основной склад запчастей находится в Польше. Логистика осуществляется собственным перевозчиком по маршруту Польша → Львов → Киев.",
          methodsTitle: "Способы получения заказа",
          selfPickup:
            "Самовывоз во Львове или Киеве — после прибытия груза на один из городов мы сообщим вам время и адрес выдачи.",
          ukrDelivery:
            "Доставка по Украине — отправляем товар из Киева на отделение или адрес «Новой почты».",
          priceText:
            "Стоимость доставки уже включена в цену запчастей, указанную на сайте. Дополнительных платежей за доставку нет.",
          timeText: "Срок доставки после оформления заказа: от 2 до 5 дней.",
        };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {t.title}
        </h1>
        <div className="mt-4 space-y-4 text-zinc-300">
          <p>{t.intro}</p>
          <div className="rounded-xl border border-zinc-700 bg-black/40 p-4 shadow-sm shadow-black/40">
            <h2 className="text-lg font-semibold">{t.methodsTitle}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>{t.selfPickup}</li>
              <li>{t.ukrDelivery}</li>
            </ul>
          </div>
          <p>{t.priceText}</p>
          <p>{t.timeText}</p>
        </div>

        {/** Раздел гарантии находится на отдельной странице /guarantee */}
      </div>
    </div>
  );
}
