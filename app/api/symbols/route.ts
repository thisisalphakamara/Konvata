import { NextResponse } from "next/server";
import { coinlayerFetch } from "@/lib/coinlayer";

export async function GET() {
  try {
    const data = await coinlayerFetch("/list");
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Unknown error" } },
      { status: 500 }
    );
  }
}
