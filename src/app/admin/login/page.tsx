"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login === "admin" && password === "privat24old") {
      if (typeof window !== "undefined") {
        localStorage.setItem("teslix_admin_auth", "1");
      }
      router.push("/admin/add-product");
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto flex max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Вход в админ-панель</h1>
        <p className="text-sm text-zinc-400">
          Доступ только для администратора. Введите логин и пароль, чтобы перейти к добавлению товаров.
        </p>
        <form onSubmit={onSubmit} className="mt-2 grid gap-3 text-sm">
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 outline-none focus:border-zinc-600"
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <button
            type="submit"
            className="mt-1 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
