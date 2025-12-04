import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const partsDir = path.join(process.cwd(), "public", "parts");

    if (!fs.existsSync(partsDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs
      .readdirSync(partsDir)
      .filter((name) => !name.startsWith("."));

    return NextResponse.json({ files });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ files: [], error: "Failed to read images" }, { status: 500 });
  }
}
