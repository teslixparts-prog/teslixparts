import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const ADMIN_PASSWORD = "privat24old";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") || "";
  if (adminKey !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Local dev requires BLOB_READ_WRITE_TOKEN; in production Vercel provides bindings automatically
    if (process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Upload failed: missing BLOB_READ_WRITE_TOKEN in .env for local development. Generate a token in Vercel → Storage → Blob → Tokens and set BLOB_READ_WRITE_TOKEN, then restart dev server.",
        },
        { status: 500 },
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploaded = await put(filename, file, { access: "public" });

    return NextResponse.json({ url: uploaded.url }, { status: 201 });
  } catch (err: any) {
    const message =
      (typeof err?.message === "string" && err.message) ||
      (typeof err === "string" ? err : "Upload failed");
    console.error("/api/admin/upload error", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
