import { NextRequest, NextResponse } from "next/server";

// TODO: вынести пароль в переменную окружения (ADMIN_PASSWORD)
const ADMIN_PASSWORD = "privat24old";

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") || "";

  if (adminKey !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
