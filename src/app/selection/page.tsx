"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";

export default function SelectionRequestPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [brand, setBrand] = useState("Tesla");
  const [model, setModel] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [extra, setExtra] = useState("");

  const ui =
    lang === "uk"
      ? {
          subject: "Індивідуальний підбір запчастин TeslixParts",
          intro:
            "Залиште заявку з VIN вашого автомобіля, і ми підберемо запчастини під конкретну комплектацію та стан машини. Менеджер зв'яжеться з вами для уточнення деталей та запропонує оптимальні варіанти.",
          brandPlaceholder: "Марка (за замовчуванням Tesla)",
          modelPlaceholder: "Модель (наприклад, Model 3, Model Y...)",
          phonePlaceholder: "Телефон (+380...)",
          fullNamePlaceholder: "ПІБ",
          emailPlaceholder: "E-mail",
          extraPlaceholder: "Додаткова інформація (VIN вашого авто тощо)",
          submitLabel: "Залишити заявку",
          backLabel: "Назад",
          mailBody: (b: string, m: string, p: string, f: string, e: string, x: string) =>
            `Марка: ${b}\nМодель: ${m}\nТелефон: ${p}\nПІБ: ${f}\nE-mail: ${e}\n\nДодаткова інформація:\n${x}`,
        }
      : {
          subject: "Индивидуальный подбор запчастей TeslixParts",
          intro:
            "Оставьте заявку с VIN вашего автомобиля, и мы подберём запчасти под конкретную комплектацию и состояние машины. Менеджер свяжется с вами для уточнения деталей и предложит оптимальные варианты.",
          brandPlaceholder: "Марка (по умолчанию Tesla)",
          modelPlaceholder: "Модель (например, Model 3, Model Y...)",
          phonePlaceholder: "Телефон (+380...)",
          fullNamePlaceholder: "ФИО",
          emailPlaceholder: "E-mail",
          extraPlaceholder: "Дополнительная информация (VIN вашего авто и т.д.)",
          submitLabel: "Оставить заявку",
          backLabel: "Назад",
          mailBody: (b: string, m: string, p: string, f: string, e: string, x: string) =>
            `Марка: ${b}\nМодель: ${m}\nТелефон: ${p}\nФИО: ${f}\nE-mail: ${e}\n\nДополнительная информация:\n${x}`,
        };

  const messageText = useMemo(
    () => ui.mailBody(brand, model, phone, fullName, email, extra),
    [brand, model, phone, fullName, email, extra, ui],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Заявка на подбор запчастей (VIN)\n\n${messageText}`,
        }),
      });

      if (!res.ok) {
        alert("Не удалось отправить заявку. Попробуйте ещё раз или напишите нам напрямую.");
        return;
      }

      router.push("/");
    } catch {
      alert("Произошла ошибка при отправке заявки. Попробуйте ещё раз чуть позже.");
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {lang === "uk" ? "Індивідуальний підбір запчастин за VIN" : "Индивидуальный подбор запчастей по VIN"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-300">{ui.intro}</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 text-sm">
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder={ui.brandPlaceholder}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
          />
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={ui.modelPlaceholder}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={ui.phonePlaceholder}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
            required
          />
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={ui.fullNamePlaceholder}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={ui.emailPlaceholder}
            type="email"
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
          />
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder={ui.extraPlaceholder}
            rows={4}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 outline-none focus:border-zinc-600"
          />
          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
            >
              {ui.submitLabel}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-zinc-700 px-5 py-2 text-sm hover:bg-zinc-900"
            >
              {ui.backLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
