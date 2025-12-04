"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, models } from "@/lib/products";

export default function AddProductAdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imagePath, setImagePath] = useState("/demo/your-image.jpg");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [oem, setOem] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [condition, setCondition] = useState<"Новая" | "Б/У" | "">("");
  const [availability, setAvailability] = useState<"В наличии" | "На заказ" | "">("");
  const [modelTag, setModelTag] = useState<string>("Model 3");
  const [categoryTag, setCategoryTag] = useState<string>(categories[0]);
  const [extraTags, setExtraTags] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = localStorage.getItem("teslix_admin_auth") === "1";
    if (!ok) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const code = useMemo(() => {
    if (!id || !title || !price) {
      return "Заполните как минимум ID, Название и Цену, чтобы увидеть код";
    }

    const numericPrice = Number(price.replace(/\s/g, ""));
    const tagsArray = [modelTag, categoryTag]
      .concat(
        extraTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      )
      .map((t) => `"${t.replace(/"/g, "'")}"`)
      .join(", ");

    const lines: string[] = [];
    lines.push("{");
    lines.push(`  id: "${id.replace(/"/g, "'")}",`);
    lines.push(`  title: "${title.replace(/"/g, "'")}",`);
    if (description) {
      lines.push(`  description: "${description.replace(/"/g, "'" )}",`);
    }
    lines.push(`  price: ${Number.isNaN(numericPrice) ? 0 : numericPrice},`);
    lines.push(`  images: ["${imagePath.replace(/"/g, "'")}"],`);
    lines.push(`  sku: "", // SKU не используется на сайте, можно оставить пустым или для внутреннего учёта`);
    lines.push(`  tags: [${tagsArray}],`);
    if (oem) {
      lines.push(`  oem: "${oem.replace(/"/g, "'")}",`);
    }
    if (compatibility) {
      lines.push(`  compatibility: "${compatibility.replace(/"/g, "'")}",`);
    }
    if (condition) {
      lines.push(`  condition: "${condition}",`);
    }
    if (availability) {
      lines.push(`  availability: "${availability}",`);
    }
    lines.push("},");

    return lines.join("\n");
  }, [id, title, description, price, imagePath, modelTag, categoryTag, extraTags, oem, compatibility, condition, availability]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-black px-6 py-12 text-zinc-50">
        <div className="mx-auto max-w-4xl text-sm text-zinc-400">Проверка доступа…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold">Добавление товара (генератор кода)</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Эта страница помогает быстро сформировать объект товара для файла <code>products.ts</code>. Заполните форму,
          затем скопируйте готовый код в раздел <code>demoProducts</code>.
        </p>

        <div className="mt-6 grid gap-4 text-sm md:grid-cols-2">
          <div className="space-y-3">
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ID товара (уникальный код, например AM3F-001)"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название товара"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание (состояние, особенности — по желанию)"
              rows={3}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Цена, грн (например 4500)"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
            />
            <div className="space-y-2">
              <input
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                placeholder="Путь к фото (например /photos/model3/part1.jpg)"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
              />
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 hover:bg-zinc-900">
                  <span>Выбрать файл для превью</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setPreviewUrl(url);
                      }
                    }}
                  />
                </label>
                <span>Файл не загружается на сервер, только предпросмотр. Фото нужно будет сохранить в public вручную.</span>
              </div>
              {previewUrl ? (
                <div className="mt-2 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 p-2">
                  <img src={previewUrl} alt="Предпросмотр" className="max-h-40 w-full object-contain" />
                </div>
              ) : null}
            </div>
            <input
              value={oem}
              onChange={(e) => setOem(e.target.value)}
              placeholder="OEM номер (по желанию)"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
            />
            <input
              value={compatibility}
              onChange={(e) => setCompatibility(e.target.value)}
              placeholder="Совместимость (например Model 3 2017–2023)"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Модель (тег)</label>
              <select
                value={modelTag}
                onChange={(e) => setModelTag(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Категория (тег)</label>
              <select
                value={categoryTag}
                onChange={(e) => setCategoryTag(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Дополнительные теги (через запятую)</label>
              <input
                value={extraTags}
                onChange={(e) => setExtraTags(e.target.value)}
                placeholder="Например: Передняя ось, Оригинал"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Состояние</label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCondition("Новая")}
                  className={`flex-1 rounded-full border px-3 py-1 ${condition === "Новая" ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : "border-zinc-700 text-zinc-300"}`}
                >
                  Новая
                </button>
                <button
                  type="button"
                  onClick={() => setCondition("Б/У")}
                  className={`flex-1 rounded-full border px-3 py-1 ${condition === "Б/У" ? "border-amber-500 bg-amber-500/10 text-amber-300" : "border-zinc-700 text-zinc-300"}`}
                >
                  Б/У
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Наличие</label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAvailability("В наличии")}
                  className={`flex-1 rounded-full border px-3 py-1 ${availability === "В наличии" ? "border-emerald-500 bg-emerald-500/10 text-emerald-300" : "border-zinc-700 text-zinc-300"}`}
                >
                  В наличии
                </button>
                <button
                  type="button"
                  onClick={() => setAvailability("На заказ")}
                  className={`flex-1 rounded-full border px-3 py-1 ${availability === "На заказ" ? "border-red-500 bg-red-500/10 text-red-300" : "border-zinc-700 text-zinc-300"}`}
                >
                  На заказ
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Сгенерированный код для products.ts</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Скопируйте блок ниже и вставьте его в массив <code>demoProducts</code> в файле <code>src/lib/products.ts</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(code.toString());
                }
              }}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-900"
            >
              Скопировать код
            </button>
          </div>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}
