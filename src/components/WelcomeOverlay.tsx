"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "teslix_welcome_shown";

export default function WelcomeOverlay() {
  // По умолчанию показываем оверлей, а в эффекте решаем, нужно ли его скрыть сразу
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const already = window.sessionStorage.getItem(STORAGE_KEY);
    if (already) {
      setVisible(false);
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, "1");

    // ~5 секунд показываем ролик, затем включаем плавное затухание
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 5000);

    // ещё ~0.6 c даём на fade-out и полностью скрываем оверлей
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative max-h-[80vh] max-w-[90vw]">
        <video
          src="/animated-logo.mp4"
          autoPlay
          muted
          playsInline
          className="h-full w-full object-contain"
        />
        {/* Слой лёгкого "тумана", который усиливается при затухании */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-radial from-zinc-200/10 via-transparent to-black/80 blur-md transition-opacity duration-700 ${
            fading ? "opacity-80" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
