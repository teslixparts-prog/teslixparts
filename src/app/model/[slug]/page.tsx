"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { categories, type Product } from "@/lib/products";
import { useParams } from "next/navigation";

export default function ModelPage() {
  const params = useParams<{ slug: string }>();
  const currentModel = useMemo(() => {
    const slug = (params?.slug || "").toLowerCase();
    const map: Record<string, string> = {
      "model-3": "Model 3",
      "model-y": "Model Y",
      "model-x": "Model X",
      "model-s": "Model S",
    };
    return map[slug] || "";
  }, [params]);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const data: Product[] = await res.json();
        if (!cancelled && Array.isArray(data)) setProducts(data);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesModel = currentModel ? p.tags.includes(currentModel) : true;
      const matchesQ = q
        ? (p.title + " " + p.description + " " + (p.oem || "") + " " + p.sku)
            .toLowerCase()
            .includes(q.toLowerCase())
        : true;
      const matchesCat = category ? p.tags.includes(category) : true;
      return matchesModel && matchesQ && matchesCat;
    });
  }, [q, category, currentModel, products]);

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">{currentModel || "Модель"}</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию, SKU или OEM"
            className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
