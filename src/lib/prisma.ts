import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import prismaPkg from "@prisma/client";

// Fallback-safe extraction of PrismaClient from the default export
const { PrismaClient } = prismaPkg as any;

const globalForPrisma = globalThis as any;

function createPrismaClient() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL is not set");
	}

	const pool = new Pool({ connectionString });
	const adapter = new PrismaPg(pool);

	return new PrismaClient({
		adapter,
		log: ["error", "warn"],
	});
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
