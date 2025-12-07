import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "work");
    const urls: string[] = [];
    if (fs.existsSync(dir)) {
      for (let i = 1; i <= 16; i++) {
        const name = `${i}.png`;
        const full = path.join(dir, name);
        if (fs.existsSync(full)) {
          urls.push(`/work/${name}`);
        }
      }
    }
    return NextResponse.json({ photos: urls });
  } catch (e) {
    return NextResponse.json({ photos: [] }, { status: 200 });
  }
}
