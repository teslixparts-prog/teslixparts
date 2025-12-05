"use client";

import { useEffect, useState } from "react";

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
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/cars");
        if (!res.ok) return;
        const data: Car[] = await res.json();
        if (!cancelled) setCars(data);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          Автомобили под разбор
        </h1>
        <p className="mt-2 text-sm text-zinc-400">Список автомобилей, доступных под разбор.</p>

        {cars.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-400">Пока нет автомобилей.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((c) => (
              <div key={c.id} className="rounded-xl border border-zinc-800 bg-black/40 p-3">
                <div className="aspect-video overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.images[0] || "/demo/car-placeholder.jpg"}
                    alt={`${c.make} ${c.model}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-3 text-sm">
                  <div className="font-semibold text-zinc-100">{c.make} {c.model} • {c.year}</div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-zinc-400">
                    <span>VIN: {c.vin}</span>
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
                        {c.status}
                      </span>
                    ) : null}
                  </div>
                  {typeof c.mileage === "number" ? (
                    <div className="text-zinc-400">Пробег: {c.mileage.toLocaleString()} км</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
