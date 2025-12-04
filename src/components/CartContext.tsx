"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Product, demoProducts } from "@/lib/products";

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  products: Product[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  total: number;
  totalCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(demoProducts);

  // Восстанавливаем корзину из localStorage при первом рендере на клиенте
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("teslix_cart");
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // если что-то пошло не так с parsing — просто игнорируем и начинаем с пустой корзины
    }
  }, []);

  const add = (productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        // Товар уже в корзине, не увеличиваем количество
        return prev;
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const remove = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clear = () => setItems([]);

  // Загружаем товары из API, чтобы корзина работала с реальной БД
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
        // если API недоступно, остаёмся на demoProducts
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const { total, totalCount } = useMemo(() => {
    let sum = 0;
    let count = 0;
    for (const item of items) {
      const p = products.find((p) => p.id === item.productId);
      if (!p) continue;
      sum += p.price * item.quantity;
      count += item.quantity;
    }
    return { total: sum, totalCount: count };
  }, [items, products]);

  // Сохраняем корзину в localStorage при каждом изменении
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("teslix_cart", JSON.stringify(items));
    } catch {
      // если localStorage недоступен — просто пропускаем
    }
  }, [items]);

  const value: CartContextValue = {
    items,
    products,
    add,
    remove,
    clear,
    total,
    totalCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
