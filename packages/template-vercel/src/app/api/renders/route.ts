import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "renders/" });

    const renders = blobs.map((blob) => ({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));

    return NextResponse.json({ type: "success" as const, data: renders });
  } catch (err) {
    return NextResponse.json(
      { type: "error" as const, message: (err as Error).message },
      { status: 500 },
    );
  }
}
