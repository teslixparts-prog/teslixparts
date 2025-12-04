"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useLanguage } from "@/components/LanguageContext";

export default function CartPage() {
  const { items, products, remove, total, totalCount } = useCart();
  const { lang } = useLanguage();

  const t =
    lang === "uk"
      ? {
          title: "Кошик",
          emptyText: "Ваш кошик порожній. Перейдіть до каталогу, щоб додати запчастини.",
          toCatalog: "До каталогу",
          quantityLabel: "Кількість:",
          remove: "Видалити",
          totalItems: "Всього позицій:",
          totalSum: "Сума замовлення:",
          checkout: "Оформити замовлення",
        }
      : {
          title: "Корзина",
          emptyText: "Ваша корзина пуста. Перейдите в каталог, чтобы добавить запчасти.",
          toCatalog: "В каталог",
          quantityLabel: "Количество:",
          remove: "Удалить",
          totalItems: "Всего позиций:",
          totalSum: "Сумма заказа:",
          checkout: "Оформить заказ",
        };

  const enriched = items
    .map((item) => {
      const p = products.find((p) => p.id === item.productId);
      if (!p) return null;
      return { item, product: p };
    })
    .filter(Boolean) as { item: { productId: string; quantity: number }; product: any }[];

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {t.title}
        </h1>
        {enriched.length === 0 ? (
          <div className="mt-6 text-zinc-300">
            {t.emptyText}
            <div className="mt-4">
              <Link
                href="/catalog"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                {t.toCatalog}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {enriched.map(({ item, product }) => (
                <div
                  key={item.productId}
                  className="flex items-start justify-between rounded-xl border border-zinc-700 bg-black/40 p-4 shadow-sm shadow-black/40"
                >
                  <div>
                    <div className="text-lg font-semibold text-zinc-100 drop-shadow-[0_0_8px_rgba(0,0,0,0.35)]">
                      {product.title}
                    </div>
                    {product.oem ? (
                      <div className="text-sm text-zinc-400">OEM: {product.oem}</div>
                    ) : null}
                    <div className="mt-1 text-sm text-zinc-400">
                      {t.quantityLabel} {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {(product.price * item.quantity).toLocaleString("ru-UA")} ₴
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      className="mt-2 text-xs text-red-400 hover:underline"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-zinc-700 bg-black/40 p-4 shadow-sm shadow-black/40">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-zinc-300">
                  {t.totalItems} {totalCount}
                  <br />
                  {t.totalSum} <span className="text-xl font-semibold">{total.toLocaleString("ru-UA")} ₴</span>
                </div>
                <Link
                  href="/request"
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-pink-200 px-5 py-2 text-sm font-semibold text-black shadow-md shadow-pink-300/40 hover:bg-pink-300 sm:mt-0"
                >
                  {t.checkout}
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
