import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: вынести пароль в переменную окружения (ADMIN_PASSWORD)
const ADMIN_PASSWORD = "privat24old";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") || "";
  if (adminKey !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    const normalized = products.map((p: (typeof products)[number]) => ({
      id: String(p.id),
      title: p.title,
      description: p.description,
      price: p.price,
      images: JSON.parse(p.images || "[]"),
      sku: p.sku,
      tags: JSON.parse(p.tags || "[]"),
      oem: p.oem ?? undefined,
      compatibility: p.compatibility ?? undefined,
      condition: p.condition ?? undefined,
      availability: p.availability ?? undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    return NextResponse.json(normalized, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    console.error("/api/admin/products GET error", err);
    const message = (typeof err?.message === "string" && err.message) || (typeof err === "string" ? err : "Server error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") || "";

  if (adminKey !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  try {
    const {
      title,
      description,
      price,
      images,
      sku,
      tags,
      oem,
      compatibility,
      condition,
      availability,
    } = body;

    if (!title || !description || !price || !images || !sku) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.product.create({
      data: {
        title,
        description,
        price: Number(price),
        images: JSON.stringify(images ?? []),
        sku,
        tags: JSON.stringify(tags ?? []),
        oem: oem ?? null,
        compatibility: compatibility ?? null,
        condition: condition ?? null,
        availability: availability ?? null,
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err: any) {
    console.error("/api/admin/products error", err);
    const message =
      (typeof err?.message === "string" && err.message) ||
      (typeof err === "string" ? err : "Server error");

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") || "";
  if (adminKey !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("/api/admin/products DELETE error", err);
    const message =
      (typeof err?.message === "string" && err.message) ||
      (typeof err === "string" ? err : "Server error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
