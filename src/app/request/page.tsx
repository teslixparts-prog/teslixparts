"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";
import { useLanguage } from "@/components/LanguageContext";

export default function RequestPage() {
  const router = useRouter();
  const { items, products, clear, total } = useCart();
  const { lang } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [comment, setComment] = useState("");
  const [showThanks, setShowThanks] = useState(false);

  const positionsText = useMemo(() => {
    return items
      .map((item) => {
        const p = products.find((p) => p.id === item.productId);
        if (!p) return null;
        if (lang === "uk") {
          return `${p.title} | кількість: ${item.quantity} | сума: ${p.price * item.quantity}₴`;
        }
        return `${p.title} | кол-во: ${item.quantity} | сумма: ${p.price * item.quantity}₴`;
      })
      .filter(Boolean)
      .join("\n");
  }, [items, products, lang]);

  const ui =
    lang === "uk"
      ? {
          title: "Оформлення замовлення",
          intro1:
            "Після оформлення заявки на ваш e‑mail ми надішлемо інвойс з реквізитами для оплати. Оплатіть рахунок — після підтвердження оплати ми зберемо та відправимо замовлення.",
          intro2:
            "Доставка здійснюється нашим перевізником за маршрутом Польща → Львів → Київ, далі по Україні (самовивіз у Львові/Києві або «Нова пошта»). Вартість доставки вже включена в ціну запчастин — додатково за доставку ви не платите.",
          compositionTitle: "Склад замовлення",
          emptyCart: "Кошик порожній. Додайте товари до кошика перед оформленням.",
          totalLabel: "Разом:",
          namePh: "Ім'я",
          phonePh: "Телефон (+380...)",
          cityPh: "Місто",
          commentPh: "Коментар",
          submitLabel: "Оформити замовлення",
          backLabel: "Назад",
          mailSubject: "Заявка з сайту TeslixParts",
          mailBody: (n: string, p: string, c: string, pos: string, sum: number, comm: string) =>
            `Ім'я: ${n}\nТелефон: ${p}\nМісто: ${c}\n\nПозиції:\n${pos}\n\nРазом: ${sum}₴\n\nКоментар: ${comm}`,
          thanksTitle: "Дякуємо за замовлення!",
          thanksText:
            "Наш менеджер зв'яжеться з вами найближчим часом для підтвердження замовлення та уточнення деталей доставки.",
          thanksCta: "На головну",
        }
      : {
          title: "Оформление заказа",
          intro1:
            "После оформления заявки на ваш e‑mail мы отправим инвойс с реквизитами для оплаты. Оплатите счёт — после подтверждения оплаты мы соберём и отправим ваш заказ.",
          intro2:
            "Доставка выполняется нашим перевозчиком по маршруту Польша → Львов → Киев, далее по Украине (самовывоз во Львове/Киеве или «Новая почта»). Стоимость доставки уже включена в цену запчастей — отдельно за доставку вы не платите.",
          compositionTitle: "Состав заказа",
          emptyCart: "Корзина пуста. Добавьте товары в корзину перед оформлением.",
          totalLabel: "Итого:",
          namePh: "Имя",
          phonePh: "Телефон (+380...)",
          cityPh: "Город",
          commentPh: "Комментарий",
          submitLabel: "Оформить заказ",
          backLabel: "Назад",
          mailSubject: "Заявка с сайта TeslixParts",
          mailBody: (n: string, p: string, c: string, pos: string, sum: number, comm: string) =>
            `Имя: ${n}\nТелефон: ${p}\nГород: ${c}\n\nПозиции:\n${pos}\n\nИтого: ${sum}₴\n\nКомментарий: ${comm}`,
          thanksTitle: "Спасибо за ваш заказ!",
          thanksText:
            "Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа и уточнения деталей доставки.",
          thanksCta: "На главную",
        };

  const mailBodyText = useMemo(
    () => ui.mailBody(name, phone, city, positionsText, total, comment),
    [name, phone, city, positionsText, comment, total, ui]
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
          message: mailBodyText,
        }),
      });

      if (!res.ok) {
        alert("Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами напрямую.");
        return;
      }

      clear();
      setShowThanks(true);
    } catch {
      alert("Произошла ошибка при отправке заявки. Попробуйте ещё раз чуть позже.");
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold uppercase tracking-[0.15em] text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.3)]">
          {ui.title}
        </h1>
        <div className="mt-4 rounded-xl border border-zinc-700 bg-black/40 p-4 text-sm text-zinc-300 shadow-sm shadow-black/40">
          <h2 className="text-lg font-semibold">{ui.compositionTitle}</h2>
          {positionsText ? (
            <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-300">
              {positionsText}
            </pre>
          ) : (
            <p className="mt-2">{ui.emptyCart}</p>
          )}
          <p className="mt-2 font-semibold">
            {ui.totalLabel} {total.toLocaleString("ru-UA")} ₴
          </p>
        </div>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ui.namePh}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={ui.phonePh}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
            required
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={ui.cityPh}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={ui.commentPh}
            rows={3}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm outline-none focus:border-zinc-600"
          />
          <div className="flex gap-3">
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

      {showThanks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900/95 p-6 text-sm text-zinc-100 shadow-xl shadow-black/60">
            <button
              type="button"
              onClick={() => {
                setShowThanks(false);
                router.push("/");
              }}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-xs text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-50"
            >
              ✕
            </button>
            <h2 className="pr-8 text-lg font-semibold text-pink-200 drop-shadow-[0_0_14px_rgba(244,114,182,0.4)]">
              {ui.thanksTitle}
            </h2>
            <p className="mt-3 text-sm text-zinc-300">{ui.thanksText}</p>
            <button
              type="button"
              onClick={() => {
                setShowThanks(false);
                router.push("/");
              }}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm shadow-pink-200/40 transition hover:bg-zinc-200"
            >
              {ui.thanksCta}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
