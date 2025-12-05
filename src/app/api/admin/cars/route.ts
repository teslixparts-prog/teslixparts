import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: move to env
const ADMIN_PASSWORD = "privat24old";

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") || "";
  if (adminKey !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  try {
    const { make, model, year, vin, mileage, images, status } = body as {
      make: string;
      model: string;
      year: number | string;
      vin: string;
      mileage?: number | string | null;
      images: string[];
      status?: string;
    };

    if (!make || !model || !year || !vin || !images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedStatus =
      status === "В наличии" || status === "В пути (возможно бронирование)" ? status : "В наличии";

    const created = await prisma.car.create({
      data: {
        make,
        model,
        year: Number(year),
        vin,
        mileage: mileage == null || mileage === "" ? null : Number(mileage),
        images: JSON.stringify(images ?? []),
        status: normalizedStatus,
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err: any) {
    console.error("/api/admin/cars error", err);
    const message = (typeof err?.message === "string" && err.message) || (typeof err === "string" ? err : "Server error");
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
    await prisma.car.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error("/api/admin/cars DELETE error", err);
    const message =
      (typeof err?.message === "string" && err.message) ||
      (typeof err === "string" ? err : "Server error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
