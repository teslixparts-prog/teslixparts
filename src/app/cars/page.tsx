"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage?: number;
  images: string[];
  status?: string;
};

export default function CarsPage() {
  const { lang } = useLanguage();
  const [cars, setCars] = useState<Car[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/cars", { cache: "no-store" });
        if (!res.ok) return;
        const data: Car[] = await res.json();
        if (!cancelled) setCars(data);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCar = openId ? cars.find((x) => x.id === openId) ?? null : null;
  const selectedImages = selectedCar?.images ?? [];
  const gotoPrev = () => setCurrentIndex((i) => (i === 0 ? (selectedImages.length || 1) - 1 : i - 1));
  const gotoNext = () => setCurrentIndex((i) => (i === (selectedImages.length || 1) - 1 ? 0 : i + 1));

  const tx =
    lang === "uk"
      ? {
          title: "Авто під розбір",
          subtitle: "Список авто, доступних під розбір.",
          empty: "Поки немає автомобілів.",
          vin: "VIN",
          mileage: "Пробіг",
          inStock: "В наявності",
          onTheWay: "В дорозі (можливе бронювання)",
          openGallery: "Відкрити галерею",
        }
      : {
          title: "Автомобили под разбор",
          subtitle: "Список автомобилей, доступных под разбор.",
          empty: "Пока нет автомобилей.",
          vin: "VIN",
          mileage: "Пробег",
          inStock: "В наличии",
          onTheWay: "В пути (возможно бронирование)",
          openGallery: "Открыть галерею",
        };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">{tx.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">{tx.subtitle}</p>

        {cars.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-400">{tx.empty}</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((c) => (
              <div key={c.id} className="rounded-xl border border-zinc-800 bg-black/40 p-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(c.id);
                    setCurrentIndex(0);
                  }}
                  className="aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
                  aria-label={tx.openGallery}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.images[0] || "/demo/car-placeholder.jpg"}
                    alt={`${c.make} ${c.model}`}
                    className="h-full w-full object-cover"
                  />
                </button>
                <div className="mt-3 text-sm">
                  <div className="font-semibold text-zinc-100">{c.make} {c.model} • {c.year}</div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-zinc-400">
                    <span>{tx.vin}: {c.vin}</span>
                    {c.status ? (
                      <span
                        className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium ${
                          c.status === "В наличии"
                            ? "bg-emerald-500/5 text-emerald-200 ring-1 ring-emerald-500/10"
                            : "bg-amber-500/5 text-amber-200 ring-1 ring-amber-500/10"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            c.status === "В наличии" ? "bg-emerald-300" : "bg-amber-300"
                          }`}
                        />
                        {lang === "uk" ? (c.status === "В наличии" ? tx.inStock : tx.onTheWay) : c.status}
                      </span>
                    ) : null}
                  </div>
                  {typeof c.mileage === "number" ? (
                    <div className="text-zinc-400">{tx.mileage}: {c.mileage.toLocaleString()} км</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {/* Lightbox */}
          {openId && selectedCar ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
              <div className="relative w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 text-zinc-50">
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-600 bg-black/60 text-base text-white shadow-md hover:bg-black/80"
                >
                  ✕
                </button>
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={gotoPrev}
                    className="hidden h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-lg text-zinc-200 hover:bg-zinc-800 sm:flex"
                  >
                    ‹
                  </button>
                  <div className="relative aspect-video w-full flex-1 overflow-hidden rounded-xl bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedImages[currentIndex]} alt={`${selectedCar.make} ${selectedCar.model}`} className="h-full w-full object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={gotoNext}
                    className="hidden h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-lg text-zinc-200 hover:bg-zinc-800 sm:flex"
                  >
                    ›
                  </button>
                </div>
                {selectedImages.length > 1 ? (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {selectedImages.map((img, idx) => (
                      <button
                        key={img + idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border ${idx === currentIndex ? "border-zinc-100" : "border-zinc-700"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`${selectedCar.make} ${selectedCar.model}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="mt-2 text-xs text-zinc-400">
                  {currentIndex + 1} / {selectedImages.length}
                </div>
              </div>
            </div>
          ) : null}
        )}
      </div>
    </div>
  );
}
