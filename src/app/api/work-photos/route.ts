import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "work");
    const urls: string[] = [];
    if (fs.existsSync(dir)) {
      for (let i = 1; i <= 16; i++) {
        const base = String(i);
        const png = path.join(dir, `${base}.png`);
        const jpg = path.join(dir, `${base}.jpg`);
        const JPG = path.join(dir, `${base}.JPG`);
        // prefer .png, else .jpg / .JPG
        if (fs.existsSync(png)) urls.push(`/work/${base}.png`);
        else if (fs.existsSync(jpg)) urls.push(`/work/${base}.jpg`);
        else if (fs.existsSync(JPG)) urls.push(`/work/${base}.JPG`);
      }
    }
    return NextResponse.json({ photos: urls });
  } catch (e) {
    return NextResponse.json({ photos: [] }, { status: 200 });
  }
}
