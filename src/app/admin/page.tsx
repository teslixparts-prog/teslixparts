"use client";

import { FormEvent, useEffect, useState } from "react";
import { categories, models } from "@/lib/products";

const initialForm = {
  title: "",
  description: "",
  price: "",
  sku: "",
  oem: "",
  compatibility: "",
  condition: "",
  availability: "",
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "x-admin-key": loginPassword,
        },
      });

      if (!res.ok) {
        throw new Error("Неверный пароль");
      }

      setAuthed(true);
      setAdminKey(loginPassword);
      setMessage("Вход выполнен, можно добавлять товары");
    } catch (err: any) {
      setError(err.message || "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/images");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.files)) {
          setAvailableImages(data.files);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authed]);

  const toggleImage = (name: string) => {
    setSelectedImages((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const priceNumber = Number(form.price);
      if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
        setError("Введите корректную цену");
        setLoading(false);
        return;
      }

      const images = selectedImages.map((name) => `/parts/${name}`);

      const tags = [selectedModel, selectedCategory].filter(Boolean);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: priceNumber,
          images,
          sku: form.sku,
          tags,
          oem: form.oem || null,
          compatibility: form.compatibility || null,
          condition: form.condition || null,
          availability: form.availability || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Ошибка сохранения");
      }

      setMessage("Товар успешно сохранён");
      setForm(initialForm);
    } catch (err: any) {
      setError(err.message || "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          Admin: товары
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Закрытая страница для добавления товаров в каталог.
        </p>

        {!authed ? (
          <form onSubmit={onLogin} className="mt-6 space-y-4 text-sm">
            <div className="rounded-xl border border-zinc-700 bg-black/40 p-4 shadow-sm shadow-black/40">
              <h2 className="text-lg font-semibold text-zinc-100">Вход в админку</h2>
              <p className="mt-2 text-xs text-zinc-400">Введите админ-пароль.</p>
              <div className="mt-3">
                <label className="block text-xs text-zinc-400">Пароль</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                  required
                />
              </div>
              {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
              {message ? <p className="mt-3 text-xs text-emerald-400">{message}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                {loading ? "Проверяем..." : "Войти"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4 text-sm">
            <p className="text-xs text-emerald-400">Вы вошли как администратор. Можно добавлять товары.</p>

            <div>
              <label className="block text-xs text-zinc-400">Название</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-zinc-400">Цена, ₴</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">OEM</label>
                <input
                  value={form.oem}
                  onChange={(e) => setForm({ ...form, oem: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400">Совместимость (текст)</label>
              <input
                value={form.compatibility}
                onChange={(e) => setForm({ ...form, compatibility: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-zinc-400">Состояние (Новая / Б/У)</label>
                <input
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Наличие</label>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="">Выберите статус</option>
                  <option value="В наличии">В наличии</option>
                  <option value="На заказ">На заказ</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-zinc-400">Модель</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="">Выберите модель</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Категория</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400">Фотографии из /public/parts</label>
              {availableImages.length === 0 ? (
                <p className="mt-2 text-xs text-zinc-500">
                  В папке <span className="font-mono">/public/parts</span> пока нет файлов. Добавьте изображения через IDE или хостинг.
                </p>
              ) : (
                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-black/30 p-2 text-xs">
                  {availableImages.map((name) => (
                    <label key={name} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-zinc-900/60">
                      <input
                        type="checkbox"
                        className="h-3 w-3 accent-pink-300"
                        checked={selectedImages.includes(name)}
                        onChange={() => toggleImage(name)}
                      />
                      <span className="font-mono text-zinc-200">{name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
            >
              {loading ? "Сохраняем..." : "Сохранить товар"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
