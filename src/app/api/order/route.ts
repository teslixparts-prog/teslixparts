import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message : "";
    const productIds = Array.isArray(body?.productIds) ? (body.productIds as string[]) : [];

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const resp = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.error("Telegram API error", resp.status, text);
      return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
    }

    // Помечаем товары как забронированные (уникальные, 1 шт.)
    if (productIds.length > 0) {
      try {
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { availability: "Забронирован" },
        });
      } catch (e) {
        console.error("Failed to update product availability after order", e);
        // Не проваливаем ответ пользователю из-за этой ошибки
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/order error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
