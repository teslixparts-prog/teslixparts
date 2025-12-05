"use client";

import { FormEvent, useEffect, useState, type ChangeEvent } from "react";
import { useLanguage } from "@/components/LanguageContext";
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
  const { lang } = useLanguage();
  const [adminKey, setAdminKey] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState<Array<{ id: string; title: string; price: number; images: string[] }>>([]);
  const [productsFilter, setProductsFilter] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverTrash, setDragOverTrash] = useState(false);

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
        throw new Error(lang === "uk" ? "Невірний пароль" : "Неверный пароль");
      }

      setAuthed(true);
      setAdminKey(loginPassword);
      setMessage(lang === "uk" ? "Вхід виконано, можна додавати товари" : "Вход выполнен, можно добавлять товары");
    } catch (err: any) {
      setError(err.message || (lang === "uk" ? "Помилка авторизації" : "Ошибка авторизации"));
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

    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) return;
        const data: any[] = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setProducts(
            data.map((p) => ({ id: String(p.id), title: p.title, price: Number(p.price || 0), images: Array.isArray(p.images) ? p.images : [] })),
          );
        }
      } catch {}
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

  const onFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!authed) {
      setError("Сначала войдите в админку");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const MAX_FILES = 10;
      const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
      const remaining = Math.max(0, MAX_FILES - selectedImages.length);

      const picked: File[] = [];
      for (let i = 0; i < files.length && picked.length < remaining; i++) {
        const f = files[i];
        if (f.size > MAX_SIZE) {
          setError(`Файл ${f.name} превышает 5 MB и будет пропущен`);
          continue;
        }
        picked.push(f);
      }
      if (picked.length === 0) {
        if (remaining === 0) setError("Достигнут лимит: максимум 10 изображений");
        setUploading(false);
        e.target.value = "";
        return;
      }

      const urls: string[] = [];
      for (let i = 0; i < picked.length; i++) {
        const fd = new FormData();
        const maybeCompressed = await compressImage(picked[i]);
        fd.append("file", maybeCompressed);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "x-admin-key": adminKey },
          body: fd,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({} as any));
          throw new Error(data?.error || "Ошибка загрузки файла");
        }
        const data = await res.json();
        if (typeof data?.url === "string") urls.push(data.url);
      }
      if (urls.length) setSelectedImages((prev) => [...prev, ...urls]);
    } catch (err: any) {
      setError(err?.message || "Не удалось загрузить изображения");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  async function compressImage(file: File): Promise<Blob> {
    // Только для изображений; для остальных типов вернём исходный файл
    if (!file.type.startsWith("image/")) return file;
    const bitmap = await createImageBitmap(file).catch(() => null as any);
    if (!bitmap) return file;

    const maxSize = 1600; // максимальная длинная сторона
    let { width, height } = bitmap;
    if (width <= maxSize && height <= maxSize) {
      // мелкие картинки не трогаем
      return file;
    }
    const ratio = width / height;
    if (width > height) {
      width = maxSize;
      height = Math.round(maxSize / ratio);
    } else {
      height = maxSize;
      width = Math.round(maxSize * ratio);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const quality = 0.82;
    const mime = file.type === "image/png" ? "image/jpeg" : "image/jpeg";
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob || file), mime, quality);
    });
  }

  const removeImage = (urlOrName: string) => {
    setSelectedImages((prev) => prev.filter((s) => s !== urlOrName));
  };

  const onDragStart = (idx: number) => () => setDragIndex(idx);
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    setSelectedImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const onTrashOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragOverTrash) setDragOverTrash(true);
  };
  const onTrashLeave = () => setDragOverTrash(false);
  const onTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null) return;
    setSelectedImages((prev) => prev.filter((_, i) => i !== dragIndex));
    setDragIndex(null);
    setDragOverTrash(false);
  };

  const moveImage = (idx: number, dir: -1 | 1) => () => {
    setSelectedImages((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[idx];
      next[idx] = next[j];
      next[j] = tmp;
      return next;
    });
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

      const images = selectedImages.map((s) => (s.startsWith("http") ? s : `/parts/${s}`));

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

  const t =
    lang === "uk"
      ? {
          adminTitle: "Адмін: товари",
          adminDesc: "Закрита сторінка для додавання товарів до каталогу.",
          loginTitle: "Вхід до адмінки",
          loginHint: "Введіть адмін‑пароль.",
          password: "Пароль",
          loginBtn: "Увійти",
          checking: "Перевіряємо...",
          youAreAuthed: "Ви увійшли як адміністратор. Можна додавати товари.",
          name: "Назва",
          desc: "Опис",
          price: "Ціна, ₴",
          sku: "SKU",
          oem: "OEM",
          compat: "Сумісність (текст)",
          condition: "Стан (Нова / Б/В)",
          availability: "Наявність",
          availabilityChoose: "Оберіть статус",
          availabilityInStock: "В наявності",
          availabilityOrder: "Під замовлення",
          model: "Модель",
          chooseModel: "Оберіть модель",
          category: "Категорія",
          chooseCategory: "Оберіть категорію",
          photos: "Фотографії",
          uploadFromPhone: "Завантажити з телефону (jpg, png)",
          pickFiles: "Обрати файли",
          pickFromPublic: "Або оберіть з /public/parts",
          noFiles: "У папці /public/parts поки немає файлів.",
          saveBtn: "Зберегти товар",
          saving: "Зберігаємо...",
          productsHeader: "Існуючі товари",
          noProducts: "Поки немає товарів.",
          delete: "Видалити",
          confirmDelete: (title: string) => `Видалити товар ${title}?`,
          searchPh: "Пошук за назвою або SKU",
        }
      : {
          adminTitle: "Admin: товары",
          adminDesc: "Закрытая страница для добавления товаров в каталог.",
          loginTitle: "Вход в админку",
          loginHint: "Введите админ‑пароль.",
          password: "Пароль",
          loginBtn: "Войти",
          checking: "Проверяем...",
          youAreAuthed: "Вы вошли как администратор. Можно добавлять товары.",
          name: "Название",
          desc: "Описание",
          price: "Цена, ₴",
          sku: "SKU",
          oem: "OEM",
          compat: "Совместимость (текст)",
          condition: "Состояние (Новая / Б/У)",
          availability: "Наличие",
          availabilityChoose: "Выберите статус",
          availabilityInStock: "В наличии",
          availabilityOrder: "На заказ",
          model: "Модель",
          chooseModel: "Выберите модель",
          category: "Категория",
          chooseCategory: "Выберите категорию",
          photos: "Фотографии",
          uploadFromPhone: "Загрузить с телефона (jpg, png)",
          pickFiles: "Выбрать файлы",
          pickFromPublic: "Или выберите из /public/parts",
          noFiles: "В папке /public/parts пока нет файлов.",
          saveBtn: "Сохранить товар",
          saving: "Сохраняем...",
          productsHeader: "Существующие товары",
          noProducts: "Пока нет товаров.",
          delete: "Удалить",
          confirmDelete: (title: string) => `Удалить товар ${title}?`,
          searchPh: "Поиск по названию или SKU",
        };

  const filteredProducts = productsFilter
    ? products.filter((p) => `${p.title}`.toLowerCase().includes(productsFilter.toLowerCase()) || `${(p as any).sku || ""}`.toLowerCase().includes(productsFilter.toLowerCase()))
    : products;

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">{t.adminTitle}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t.adminDesc}</p>

        {!authed ? (
          <form onSubmit={onLogin} className="mt-6 space-y-4 text-sm">
            <div className="rounded-xl border border-zinc-700 bg-black/40 p-4 shadow-sm shadow-black/40">
              <h2 className="text-lg font-semibold text-zinc-100">{t.loginTitle}</h2>
              <p className="mt-2 text-xs text-zinc-400">{t.loginHint}</p>
              <div className="mt-3">
                <label className="block text-xs text-zinc-400">{t.password}</label>
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
                {loading ? t.checking : t.loginBtn}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4 text-sm">
            <p className="text-xs text-emerald-400">{t.youAreAuthed}</p>

            <div>
              <label className="block text-xs text-zinc-400">{t.name}</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400">{t.desc}</label>
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
                <label className="block text-xs text-zinc-400">{t.price}</label>
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">{t.sku}</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">{t.oem}</label>
                <input
                  value={form.oem}
                  onChange={(e) => setForm({ ...form, oem: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400">{t.compat}</label>
              <input
                value={form.compatibility}
                onChange={(e) => setForm({ ...form, compatibility: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-zinc-400">{t.condition}</label>
                <input
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">{t.availability}</label>
                <select
                  value={form.availability}
                  onChange={(e) => setForm({ ...form, availability: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="">{t.availabilityChoose}</option>
                  <option value="В наличии">{t.availabilityInStock}</option>
                  <option value="На заказ">{t.availabilityOrder}</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-zinc-400">{t.model}</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="">{t.chooseModel}</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">{t.category}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="">{t.chooseCategory}</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400">{t.photos}</label>
              <div className="mt-2 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-black/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400">{t.uploadFromPhone}</div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-900">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onFilesSelected}
                      className="hidden"
                    />
                    <span className="text-zinc-200">{uploading ? (lang === "uk" ? "Завантажується..." : "Загружается...") : t.pickFiles}</span>
                  </label>
                </div>
                {selectedImages.length > 0 ? (
                  <>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedImages.map((url, idx) => (
                        <div
                          key={url}
                          draggable
                          onDragStart={onDragStart(idx)}
                          onDragOver={onDragOver}
                          onDrop={onDrop(idx)}
                          className="group relative h-20 w-28 cursor-move overflow-hidden rounded border border-zinc-700 bg-zinc-900"
                          title="Перетащите, чтобы изменить порядок"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url.startsWith("http") ? url : `/parts/${url}`}
                            alt="preview"
                            className="h-full w-full object-cover"
                          />
                          <div className="pointer-events-none absolute inset-x-1 top-1 flex justify-between opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={moveImage(idx, -1)}
                              className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-black/60 text-xs text-zinc-200 hover:bg-black/80"
                              aria-label="Влево"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={moveImage(idx, 1)}
                              className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-black/60 text-xs text-zinc-200 hover:bg-black/80"
                              aria-label="Вправо"
                            >
                              ›
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute right-1 bottom-1 hidden h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-black/60 text-[11px] text-zinc-200 shadow-sm hover:bg-black/80 group-hover:flex"
                            aria-label="Удалить изображение"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {dragIndex !== null ? (
                      <div
                        onDragOver={onTrashOver}
                        onDragLeave={onTrashLeave}
                        onDrop={onTrashDrop}
                        className={`mt-3 flex items-center justify-center rounded-lg border-2 p-3 text-xs transition ${
                          dragOverTrash ? "border-red-400 bg-red-500/10 text-red-200" : "border-zinc-700 bg-black/40 text-zinc-300"
                        }`}
                      >
                        Перетащите сюда, чтобы удалить изображение
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
              <div className="mt-3">
                <label className="block text-xs text-zinc-400">{t.pickFromPublic}</label>
                {availableImages.length === 0 ? (
                  <p className="mt-2 text-xs text-zinc-500">{t.noFiles}</p>
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
            </div>

            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
            >
              {loading ? t.saving : t.saveBtn}
            </button>

            {/* Список существующих товаров */}
            <div className="mt-10 rounded-xl border border-zinc-800 bg-black/30 p-3">
              <div className="mb-2 text-sm font-semibold text-zinc-100">{t.productsHeader}</div>
              <input
                value={productsFilter}
                onChange={(e) => setProductsFilter(e.target.value)}
                placeholder={t.searchPh}
                className="mb-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs outline-none focus:border-zinc-600"
              />
              {filteredProducts.length === 0 ? (
                <div className="text-xs text-zinc-400">{t.noProducts}</div>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
                  {filteredProducts.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={(p.images && p.images[0]) || "/demo/am3f-001.jpg"} className="h-10 w-14 flex-shrink-0 rounded object-cover" alt="" />
                        <div className="min-w-0">
                          <div className="truncate text-zinc-100">{p.title}</div>
                          <div className="text-xs text-zinc-400">{p.id}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(t.confirmDelete(p.title))) return;
                          try {
                            const res = await fetch(`/api/admin/products?id=${encodeURIComponent(p.id)}`, {
                              method: "DELETE",
                              headers: { "x-admin-key": adminKey },
                            });
                            if (!res.ok && res.status !== 204) {
                              const data = await res.json().catch(() => ({}));
                              throw new Error(data?.error || (lang === "uk" ? "Помилка видалення" : "Ошибка удаления"));
                            }
                            setProducts((prev) => prev.filter((x) => x.id !== p.id));
                          } catch (err: any) {
                            alert(err?.message || (lang === "uk" ? "Помилка видалення" : "Ошибка удаления"));
                          }
                        }}
                        className="rounded-full border border-red-500/50 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        {t.delete}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
