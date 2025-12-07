export default function UpdatesPage() {
  const updates: { date: string; title: string; desc: string }[] = [
    {
      date: "2025-12-07",
      title: "Сессия админ‑панели сохраняется 30 дней",
      desc: "После входа через /admin/login авторизация хранится 30 дней (cookie + localStorage). Больше не нужно логиниться при каждом размещении объявлений.",
    },
    {
      date: "2025-12-05",
      title: "Деплой на Vercel",
      desc: "Проект опубликован на Vercel. Настроены окружения и базовые оптимизации для продакшена.",
    },
  ];

  return (
    <div className="min-h-screen px-6 py-10 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">Обновления TESLIXPARTS</h1>
        <p className="mt-2 text-sm text-zinc-400">Хронологический список изменений на сайте.</p>

        <div className="mt-6 space-y-4">
          {updates.map((u, i) => (
            <article key={i} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="text-xs text-zinc-400">{u.date}</div>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">{u.title}</h2>
              <p className="mt-1 text-sm text-zinc-300">{u.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
