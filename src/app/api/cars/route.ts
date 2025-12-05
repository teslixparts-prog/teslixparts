import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
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
    return new NextResponse(JSON.stringify(normalized), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    console.error("/api/cars error", err);
    const message = (typeof err?.message === "string" && err.message) || (typeof err === "string" ? err : "Server error");
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
}
