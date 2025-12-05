import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cars = await prisma.car.findMany({ orderBy: { createdAt: "desc" } });
    const normalized = cars.map((c: (typeof cars)[number]) => ({
      id: String(c.id),
      make: c.make,
      model: c.model,
      year: c.year,
      vin: c.vin,
      mileage: c.mileage ?? undefined,
      images: JSON.parse(c.images || "[]"),
      status: c.status,
    }));
    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error("/api/cars error", err);
    const message = (typeof err?.message === "string" && err.message) || (typeof err === "string" ? err : "Server error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
