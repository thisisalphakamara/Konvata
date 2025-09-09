// Updated to fix TypeScript error
import { NextResponse, NextRequest } from "next/server";
import { coinlayerFetch, LiveRatesResponse } from "@/lib/coinlayer";

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string | number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target") ?? "USD";
    const symbols = searchParams.get("symbols") ?? undefined;
    const expand = searchParams.get("expand") ?? undefined;

    const data = await coinlayerFetch<LiveRatesResponse>(`/${date}`, {
      target,
      symbols,
      expand,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error?.message || "An unknown error occurred",
          code: 'INTERNAL_SERVER_ERROR'
        } 
      } as ErrorResponse,
      { status: 500 }
    );
  }
}
