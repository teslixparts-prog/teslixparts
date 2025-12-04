import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const products = await prisma.product.findMany({
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

		return NextResponse.json(normalized);
	} catch (err: any) {
		console.error("/api/products error", err);
		const message =
			(typeof err?.message === "string" && err.message) ||
			(typeof err === "string" ? err : "Server error");

		return NextResponse.json({ error: message }, { status: 500 });
	}
}
