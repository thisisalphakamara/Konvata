import { NextResponse } from "next/server";
import { coinlayerFetch } from "@/lib/coinlayer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target") ?? undefined;
    const symbols = searchParams.get("symbols") ?? undefined;
    const expand = searchParams.get("expand") ?? undefined;

    const data = await coinlayerFetch("/live", {
      target,
      symbols,
      expand,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err?.message || "Unknown error" } },
      { status: 500 }
    );
  }
}
