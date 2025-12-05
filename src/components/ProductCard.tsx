"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Product } from "@/lib/products";
import { useCart } from "@/components/CartContext";

export default function ProductCard({ p }: { p: Product }) {
  const { add, remove, items } = useCart();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fly, setFly] = useState(false);
  const [flyPos, setFlyPos] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLDivElement | null>(null);

  const images = (p.images || []).slice(0, 10);

  const showGallery = images.length > 0;

  const inCart = items.some((i) => i.productId === p.id);

  const gotoPrev = () => {
    if (!showGallery) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const gotoNext = () => {
    if (!showGallery) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="rounded-xl border border-zinc-700 bg-black/40 p-4 shadow-sm shadow-black/40 hover:border-zinc-500">
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900 ${
          showGallery ? "cursor-pointer" : ""
        }`}
        ref={imgRef}
        onClick={() => {
          if (!showGallery) return;
          setCurrentIndex(0);
          setOpen(true);
        }}
      >
        {showGallery ? (
          <Image
            src={images[0]}
            alt={p.title}
            fill
            className="object-cover opacity-80 transition duration-200 hover:scale-105 hover:opacity-100"
          />
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
      {p.oem ? <div className="mt-1 text-sm text-zinc-400">OEM: {p.oem}</div> : null}
      {p.compatibility ? (
        <div className="text-sm text-zinc-400">Совместимость: {p.compatibility}</div>
      ) : null}
      {p.availability ? (
        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-transform transition-colors duration-150 hover:-translate-y-[1px] hover:text-zinc-100 ${
              p.availability === "В наличии"
                ? "bg-emerald-500/3 text-emerald-200 ring-1 ring-emerald-500/10"
                : p.availability === "Забронирован"
                ? "bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/20"
                : "bg-red-500/3 text-red-200 ring-1 ring-red-500/10"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                p.availability === "В наличии"
                  ? "bg-emerald-200"
                  : p.availability === "Забронирован"
                  ? "bg-amber-300"
                  : "bg-red-200"
              }`}
            />
            {p.availability}
          </span>
        </div>
      ) : null}
      <div className="mt-3 text-xl font-bold">{p.price.toLocaleString("ru-UA")} ₴</div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
        {p.tags.map((t: string) => (
          <span key={t} className="rounded-full border border-zinc-700 px-2 py-1">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (inCart) return;
            if (imgRef.current) {
              const rect = imgRef.current.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = rect.top + rect.height / 2;
              setFlyPos({ x, y });
              setFly(true);
              setTimeout(() => {
                setFly(false);
                setFlyPos(null);
              }, 750);
            }
            add(p.id);
          }}
          disabled={inCart || p.availability !== "В наличии"}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
            inCart || p.availability !== "В наличии"
              ? "cursor-default bg-zinc-700 text-zinc-300"
              : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          {inCart
            ? "Уже в корзине"
            : p.availability === "Забронирован"
            ? "Забронировано"
            : p.availability === "На заказ"
            ? "Нет в наличии"
            : "В корзину"}
        </button>
        <Link
          href="/cart"
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
        >
          Перейти в корзину
        </Link>
      </div>
      {inCart ? (
        <button
          type="button"
          onClick={() => remove(p.id)}
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400 hover:border-red-400 hover:text-red-300"
        >
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-red-500/10 text-[10px] text-red-300">
            ✕
          </span>
          <span>Удалить</span>
        </button>
      ) : null}
      {fly && flyPos && (
        <div
          className="pointer-events-none fixed left-0 top-0 z-50"
          style={{
            left: flyPos.x,
            top: flyPos.y,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            "--start-x": `${flyPos.x}px`,
            // @ts-ignore
            "--start-y": `${flyPos.y}px`,
          }}
        >
          <div className="fly-to-cart-dot relative h-10 w-10">
            <Image src="/посылка.png" alt="Посылка" fill className="object-contain" />
          </div>
        </div>
      )}
      {open && showGallery ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 text-zinc-50">
            <button
              type="button"
              onClick={() => setOpen(false)}
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
              <div className="relative aspect-square max-h-[420px] w-full flex-1 overflow-hidden rounded-xl bg-black">
                <Image
                  src={images[currentIndex]}
                  alt={p.title}
                  fill
                  className="object-contain"
                />
              </div>
              <button
                type="button"
                onClick={gotoNext}
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-lg text-zinc-200 hover:bg-zinc-800 sm:flex"
              >
                ›
              </button>
            </div>
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md border ${
                      idx === currentIndex ? "border-zinc-100" : "border-zinc-700"
                    }`}
                  >
                    <Image src={img} alt={p.title} fill className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-2 text-xs text-zinc-400">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
