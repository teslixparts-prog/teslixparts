import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const products = await prisma.product.findMany({
			where: { availability: { in: ["В наличии", "Забронирован"] } },
			orderBy: { createdAt: "desc" },
		});

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
		}));

		return new NextResponse(JSON.stringify(normalized), {
			status: 200,
			headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
		});
	} catch (err: any) {
		console.error("/api/products error", err);
		const message =
			(typeof err?.message === "string" && err.message) ||
			(typeof err === "string" ? err : "Server error");

		return new NextResponse(JSON.stringify({ error: message }), {
			status: 500,
			headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
		});
	}
}
