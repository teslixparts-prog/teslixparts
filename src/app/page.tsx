"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

export default function Home() {
  const { lang } = useLanguage();

  const t =
    lang === "uk"
      ? {
          heroSubtitle: "Запчастини для Tesla. Швидко. Надійно.",
          modelsTitle: "Вибір моделі",
          modelsDescription: "Спочатку оберіть модель Tesla, потім переходьте до каталогу запчастин.",
          workTitle: "Наша робота зсередини",
          vinTitle: "Підбір запчастин за VIN",
          vinDescription:
            "Надішліть нам VIN вашого авто і коротко опишіть, які деталі потрібні. Ми підберемо сумісні запчастини під вашу комплектацію і надішлемо варіанти з цінами та фото.",
          vinHint:
            "Рекомендуємо вказувати VIN, рік випуску та коротко описувати ситуацію (ДТП, заміна вузла, профілактика тощо).",
          deliveryPaymentTitle: "Доставка та оплата",
          deliveryPaymentText:
            "Ми забезпечуємо найкоротшу та безпечну доставку, а також надаємо 14 днів гарантії на кожну деталь. Після оформлення замовлення ви отримаєте інвойс на e‑mail, за яким зможете зручно та безпечно оплатити покупку.",
          linkDelivery: "Докладніше про доставку",
          linkPayment: "Докладніше про оплату",
          linkGuarantee: "Гарантія",
          linkAbout: "Про компанію TeslixParts",
          vinButton: "Залишити заявку на підбір",
          catalogButton: "Перейти до каталогу",
        }
      : {
          heroSubtitle: "Запчасти для Tesla. Быстро. Надёжно.",
          modelsTitle: "Выбор модели",
          modelsDescription: "Сначала выберите модель Tesla, затем переходите к каталогу запчастей.",
          workTitle: "Наша работа изнутри",
          vinTitle: "Подбор запчастей по VIN",
          vinDescription:
            "Отправьте нам VIN вашего авто и кратко опишите, какие детали нужны. Мы подберём совместимые запчасти под вашу комплектацию и отправим варианты с ценами и фото.",
          vinHint:
            "Рекомендуем указывать VIN, год выпуска и кратко описывать ситуацию (ДТП, замена узла, профилактика и т.д.).",
          deliveryPaymentTitle: "Доставка и оплата",
          deliveryPaymentText:
            "Мы обеспечиваем кратчайшую и безопасную доставку, а также предоставляем 14 дней гарантии на каждый товар. После оформления заказа вы получите инвойс на e‑mail, по которому сможете удобно и безопасно оплатить покупку.",
          linkDelivery: "Подробнее о доставке",
          linkPayment: "Подробнее об оплате",
          linkGuarantee: "Гарантия",
          linkAbout: "О компании TeslixParts",
          vinButton: "Оставить заявку на подбор",
          catalogButton: "Перейти в каталог",
        };
  // Work photos state
  const [photos, setPhotos] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/work-photos")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const arr = Array.isArray(d?.photos) ? d.photos : [];
        setPhotos(arr);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // autoplay
  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % photos.length);
    }, 4500);
    return () => clearInterval(id);
  }, [photos.length]);

  const ordered = useMemo(() => {
    if (!photos.length) return [] as string[];
    const res = [photos[idx]];
    // pick prev and next if exist
    const prev = photos[(idx - 1 + photos.length) % photos.length];
    const next = photos[(idx + 1) % photos.length];
    return [prev, photos[idx], next];
  }, [photos, idx]);

  return (
    <div className="text-zinc-50">
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo1.PNG" alt="TESLIX" width={72} height={72} />
            <div>
              <h1 className="text-[30px] font-semibold uppercase tracking-[0.2em] text-pink-200 drop-shadow-[0_0_18px_rgba(244,114,182,0.35)]">
                TESLIX PARTS
              </h1>
              <p className="text-zinc-400">{t.heroSubtitle}</p>
            </div>
          </div>
          <Link
            href="/catalog"
            className="rounded-full bg-pink-200 px-5 py-3 text-sm font-semibold text-black shadow-md shadow-pink-300/40 hover:bg-pink-300"
          >
            Перейти в каталог
          </Link>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">{t.modelsTitle}</h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            {t.modelsDescription}
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "Model 3", href: "/model/model-3", img: "/Model 3.png" },
              { label: "Model Y", href: "/model/model-y", img: "/Model Y.png" },
              { label: "Model X", href: "/model/model-x", img: "/Model X.png" },
              { label: "Model S", href: "/model/model-s", img: "/Model S.png" },
              { label: "Cybertruck", href: "/model/cybertruck", img: "/Cybertruck.png" },
            ].map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="group flex flex-col items-center rounded-xl border border-zinc-700 bg-black/40 p-4 shadow-sm shadow-black/40 transition hover:border-zinc-500 hover:bg-zinc-900/80"
              >
                <div className="relative mb-3 h-20 w-full overflow-hidden rounded-md bg-zinc-900">
                  <Image
                    src={m.img}
                    alt={m.label}
                    fill
                    className="object-contain opacity-60 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-lg font-semibold">{m.label}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h2 className="text-2xl font-semibold">{t.vinTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-300">
            {t.vinDescription}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/selection"
              className="rounded-full bg-pink-200 px-5 py-2 text-sm font-semibold text-black shadow-md shadow-pink-300/40 hover:bg-pink-300"
            >
              {t.vinButton}
            </Link>
            <p className="text-xs text-zinc-400">
              {t.vinHint}
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
            {t.deliveryPaymentTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-400">
            {t.deliveryPaymentText}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/delivery"
              className="text-sm text-zinc-300 underline underline-offset-4 transition hover:text-white hover:decoration-zinc-300 hover:underline-offset-8 hover:-translate-y-[1px]"
            >
              {t.linkDelivery}
            </Link>
            <Link
              href="/payment"
              className="text-sm text-zinc-300 underline underline-offset-4 transition hover:text-white hover:decoration-zinc-300 hover:underline-offset-8 hover:-translate-y-[1px]"
            >
              {t.linkPayment}
            </Link>
            <Link
              href="/guarantee"
              className="text-sm text-zinc-300 underline underline-offset-4 transition hover:text-white hover:decoration-zinc-300 hover:underline-offset-8 hover:-translate-y-[1px]"
            >
              {t.linkGuarantee}
            </Link>
            <Link
              href="/about"
              className="text-sm text-zinc-300 underline underline-offset-4 transition hover:text-white hover:decoration-зinc-300 hover:underline-offset-8 hover:-translate-y-[1px]"
            >
              {t.linkAbout}
            </Link>
          </div>
        </section>

        {photos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold">{t.workTitle}</h2>
            <div className="relative mt-6 overflow-hidden">
              <div className="flex items-center justify-center gap-4">
                {ordered.map((src, i) => (
                  <div
                    key={src + i}
                    className={`relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/30 ring-1 ring-white/5 ${
                      i === 1
                        ? "h-44 w-72 sm:h-56 sm:w-96 opacity-100"
                        : "h-28 w-40 sm:h-44 sm:w-64 opacity-20 blur-md"
                    }`}
                  >
                    <Image
                      src={src}
                      alt="work"
                      fill
                      sizes="(max-width: 768px) 90vw, 33vw"
                      className={`object-cover transition-transform duration-1200 ${
                        i === 1 ? "scale-100" : "scale-95"
                      }`}
                      priority={i === 1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
