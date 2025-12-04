"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Lang = "ru" | "uk";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("teslix_lang");
      if (stored === "ru" || stored === "uk") {
        setLangState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (value: Lang) => {
    setLangState(value);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("teslix_lang", value);
      } catch {
        // ignore
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
