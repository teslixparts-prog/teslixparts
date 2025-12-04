"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { categories, demoProducts, models, type Product } from "@/lib/products";
import { useLanguage } from "@/components/LanguageContext";

export default function CatalogPage() {
  const { lang } = useLanguage();
  const [q, setQ] = useState("");
  const [model, setModel] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [modelOpen, setModelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(demoProducts);

  const t =
    lang === "uk"
      ? {
          title: "Каталог запчастин",
          searchPlaceholder: "Пошук за назвою, SKU або OEM",
          allModels: "Усі моделі",
          allCategories: "Усі категорії",
        }
      : {
          title: "Каталог запчастей",
          searchPlaceholder: "Поиск по названию, SKU или OEM",
          allModels: "Все модели",
          allCategories: "Все категории",
        };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQ = q
        ? (p.title + " " + p.description + " " + (p.oem || "") + " " + p.sku)
            .toLowerCase()
            .includes(q.toLowerCase())
        : true;
      const matchesModel = model ? p.tags.includes(model) : true;
      const matchesCat = category ? p.tags.includes(category) : true;
      return matchesQ && matchesModel && matchesCat;
    });
  }, [q, model, category, products]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data: Product[] = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch {
        // fail silently, keep demoProducts
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {t.title}
        </h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setModelOpen((v) => !v);
                setCategoryOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-sm text-zinc-100 outline-none hover:border-zinc-600 focus:border-zinc-600"
            >
              <span>{model || t.allModels}</span>
              <span className="ml-2 text-xs text-zinc-400">▾</span>
            </button>
            {modelOpen ? (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/95 text-sm text-zinc-100 shadow-lg shadow-black/40">
                <button
                  type="button"
                  onClick={() => {
                    setModel("");
                    setModelOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-800 ${
                    model === "" ? "bg-zinc-800/70" : ""
                  }`}
                >
                  <span>{t.allModels}</span>
                </button>
                {models.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setModel(m);
                      setModelOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-800 ${
                      model === m ? "bg-zinc-800/70" : ""
                    }`}
                  >
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setCategoryOpen((v) => !v);
                setModelOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-sm text-zinc-100 outline-none hover:border-zinc-600 focus:border-zinc-600"
            >
              <span>{category || t.allCategories}</span>
              <span className="ml-2 text-xs text-zinc-400">▾</span>
            </button>
            {categoryOpen ? (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/95 text-sm text-zinc-100 shadow-lg shadow-black/40">
                <button
                  type="button"
                  onClick={() => {
                    setCategory("");
                    setCategoryOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-800 ${
                    category === "" ? "bg-zinc-800/70" : ""
                  }`}
                >
                  <span>{t.allCategories}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setCategoryOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-zinc-800 ${
                      category === c ? "bg-zinc-800/70" : ""
                    }`}
                  >
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
