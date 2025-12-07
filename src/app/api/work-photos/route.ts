import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "work");
    let files: string[] = [];
    if (fs.existsSync(dir)) {
      files = fs
        .readdirSync(dir)
        .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
    const urls = files.map((f) => `/work/${f}`);
    return NextResponse.json({ photos: urls });
  } catch (e) {
    return NextResponse.json({ photos: [] }, { status: 200 });
  }
}
