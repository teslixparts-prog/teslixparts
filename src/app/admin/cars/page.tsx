"use client";

import { FormEvent, useEffect, useState, type ChangeEvent } from "react";
import { useLanguage } from "@/components/LanguageContext";

const carModels = ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"];

export default function AdminCarsPage() {
  const { lang } = useLanguage();
  const [loginPassword, setLoginPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);

  const [make, setMake] = useState("Tesla");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [status, setStatus] = useState<string>("В наличии");

  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverTrash, setDragOverTrash] = useState(false);
  const [cars, setCars] = useState<Array<{ id: string; make: string; model: string; year: number; images: string[] }>>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "x-admin-key": loginPassword } });
      if (!res.ok) throw new Error("Неверный пароль");
      setAuthed(true);
      setAdminKey(loginPassword);
      setMessage("Вход выполнен, можно добавлять авто");
    } catch (err: any) {
      setError(err?.message || "Ошибка авторизации");
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
        if (!cancelled && Array.isArray(data.files)) setAvailableImages(data.files);
      } catch {}
    })();
    (async () => {
      try {
        const res = await fetch("/api/cars", { cache: "no-store" });
        if (!res.ok) return;
        const data: any[] = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setCars(
            data.map((c) => ({ id: String(c.id), make: c.make, model: c.model, year: Number(c.year || 0), images: Array.isArray(c.images) ? c.images : [] })),
          );
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [authed]);

  const toggleImage = (name: string) => {
    setSelectedImages((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
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
      const MAX_SIZE = 5 * 1024 * 1024;
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
    if (!file.type.startsWith("image/")) return file;
    const bitmap = await createImageBitmap(file).catch(() => null as any);
    if (!bitmap) return file;
    const maxSize = 1600;
    let { width, height } = bitmap;
    if (width <= maxSize && height <= maxSize) return file;
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
    const mime = "image/jpeg";
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob || file), mime, quality);
    });
  }

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
    setDragOverTrash(true);
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
  const removeImage = (url: string) => setSelectedImages((prev) => prev.filter((s) => s !== url));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (!model) throw new Error("Выберите модель");
      const yearNum = Number(year);
      if (!Number.isFinite(yearNum)) throw new Error("Укажите корректный год");
      if (!vin || vin.length < 5) throw new Error("Укажите VIN");
      const images = selectedImages.map((s) => (s.startsWith("http") ? s : `/parts/${s}`));
      if (images.length === 0) throw new Error("Добавьте хотя бы одно фото");

      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ make, model, year: yearNum, vin, mileage: mileage ? Number(mileage) : null, images, status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Ошибка сохранения");
      }
      setMessage("Авто сохранено");
      setMake("Tesla");
      setModel("");
      setYear("");
      setVin("");
      setMileage("");
      setStatus("В наличии");
      setSelectedImages([]);
    } catch (err: any) {
      setError(err?.message || "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {lang === "uk" ? "Адмін: авто під розбір" : "Admin: авто под разбор"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{lang === "uk" ? "Додавання авто під розбір." : "Добавление автомобилей под разбор."}</p>

        {!authed ? (
          <form onSubmit={onLogin} className="mt-6 space-y-4 text-sm">
            <div className="rounded-xl border border-zinc-700 bg-black/40 p-4 shadow-sm shadow-black/40">
              <h2 className="text-lg font-semibold text-zinc-100">Вход в админку</h2>
              <div className="mt-3">
                <label className="block text-xs text-zinc-400">Пароль</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600" required />
              </div>
              {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
              {message ? <p className="mt-3 text-xs text-emerald-400">{message}</p> : null}
              <button type="submit" className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200">Войти</button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4 text-sm">
            <p className="text-xs text-emerald-400">{lang === "uk" ? "Ви ввійшли як адміністратор. Можна додавати авто." : "Вы вошли как администратор. Можно добавлять авто."}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-zinc-400">{lang === "uk" ? "Марка" : "Марка"}</label>
                <input value={make} onChange={(e) => setMake(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">{lang === "uk" ? "Модель" : "Модель"}</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600">
                  <option value="">Выберите модель</option>
                  {carModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-zinc-400">{lang === "uk" ? "Рік випуску" : "Год выпуска"}</label>
                <input value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600" placeholder="2021" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">VIN</label>
                <input value={vin} onChange={(e) => setVin(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400">{lang === "uk" ? "Пробіг, км" : "Пробег, км"}</label>
                <input value={mileage} onChange={(e) => setMileage(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600" placeholder="120000" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400">{lang === "uk" ? "Статус" : "Статус"}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              >
                <option value="В наличии">{lang === "uk" ? "В наявності" : "В наличии"}</option>
                <option value="В пути (возможно бронирование)">{lang === "uk" ? "В дорозі (можливе бронювання)" : "В пути (возможно бронирование)"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400">{lang === "uk" ? "Фотографії" : "Фотографии"}</label>
              <div className="mt-2 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-black/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400">{lang === "uk" ? "Завантажити з телефону (jpg, png)" : "Загрузить с телефона (jpg, png)"}</div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-900">
                    <input type="file" accept="image/*" multiple onChange={onFilesSelected} className="hidden" />
                    <span className="text-zinc-200">{uploading ? "Загружается..." : "Выбрать файлы"}</span>
                  </label>
                </div>
                {selectedImages.length > 0 ? (
                  <>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedImages.map((url, idx) => (
                        <div key={url} draggable onDragStart={onDragStart(idx)} onDragOver={onDragOver} onDrop={onDrop(idx)} className="group relative h-20 w-28 cursor-move overflow-hidden rounded border border-zinc-700 bg-zinc-900" title="Перетащите, чтобы изменить порядок">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url.startsWith("http") ? url : `/parts/${url}`} alt="preview" className="h-full w-full object-cover" />
                          <div className="pointer-events-none absolute inset-x-1 top-1 flex justify-between opacity-0 transition group-hover:opacity-100">
                            <button type="button" onClick={moveImage(idx, -1)} className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-black/60 text-xs text-zinc-200 hover:bg-black/80" aria-label="Влево">‹</button>
                            <button type="button" onClick={moveImage(idx, 1)} className="pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-black/60 text-xs text-zinc-200 hover:bg-black/80" aria-label="Вправо">›</button>
                          </div>
                          <button type="button" onClick={() => removeImage(url)} className="absolute right-1 bottom-1 hidden h-6 w-6 items-center justify-center rounded-full border border-zinc-600 bg-black/60 text-[11px] text-zinc-200 shadow-sm hover:bg-black/80 group-hover:flex" aria-label="Удалить изображение">✕</button>
                        </div>
                      ))}
                    </div>
                    {dragIndex !== null ? (
                      <div onDragOver={onTrashOver} onDragLeave={onTrashLeave} onDrop={onTrashDrop} className={`mt-3 flex items-center justify-center rounded-lg border-2 p-3 text-xs transition ${dragOverTrash ? "border-red-400 bg-red-500/10 text-red-200" : "border-zinc-700 bg-black/40 text-zinc-300"}`}>
                        Перетащите сюда, чтобы удалить изображение
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
              <div className="mt-3">
                <label className="block text-xs text-zinc-400">Или выберите из /public/parts</label>
                {availableImages.length === 0 ? (
                  <p className="mt-2 text-xs text-zinc-500">В папке <span className="font-mono">/public/parts</span> пока нет файлов.</p>
                ) : (
                  <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-black/30 p-2 text-xs">
                    {availableImages.map((name) => (
                      <label key={name} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-zinc-900/60">
                        <input type="checkbox" className="h-3 w-3 accent-pink-300" checked={selectedImages.includes(name)} onChange={() => toggleImage(name)} />
                        <span className="font-mono text-zinc-200">{name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button type="submit" disabled={loading} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-зinc-200 disabled:opacity-60">{loading ? (lang === "uk" ? "Зберігаємо..." : "Сохраняем...") : (lang === "uk" ? "Зберегти авто" : "Сохранить авто")}</button>

            {/* Список существующих авто */}
            <div className="mt-10 rounded-xl border border-zinc-800 bg-black/30 p-3">
              <div className="mb-2 text-sm font-semibold text-zinc-100">{lang === "uk" ? "Існуючі авто" : "Существующие авто"}</div>
              {cars.length === 0 ? (
                <div className="text-xs text-zinc-400">{lang === "uk" ? "Поки немає авто." : "Пока нет авто."}</div>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
                  {cars.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={(c.images && c.images[0]) || "/demo/car-placeholder.jpg"} className="h-10 w-14 flex-shrink-0 rounded object-cover" alt="" />
                        <div className="min-w-0">
                          <div className="truncate text-zinc-100">{c.make} {c.model} • {c.year}</div>
                          <div className="text-xs text-zinc-400">{c.id}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm((lang === "uk" ? "Видалити авто " : "Удалить авто ") + `${c.make} ${c.model}?`)) return;
                          try {
                            const res = await fetch(`/api/admin/cars?id=${encodeURIComponent(c.id)}`, {
                              method: "DELETE",
                              headers: { "x-admin-key": adminKey },
                            });
                            if (!res.ok && res.status !== 204) {
                              const data = await res.json().catch(() => ({}));
                              throw new Error(data?.error || (lang === "uk" ? "Помилка видалення" : "Ошибка удаления"));
                            }
                            setCars((prev) => prev.filter((x) => x.id !== c.id));
                          } catch (err: any) {
                            alert(err?.message || (lang === "uk" ? "Помилка видалення" : "Ошибка удаления"));
                          }
                        }}
                        className="rounded-full border border-red-500/50 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        {lang === "uk" ? "Видалити" : "Удалить"}
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
