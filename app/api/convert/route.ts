import { NextResponse, NextRequest } from "next/server";
import { coinlayerFetch, ConvertResponse, LiveRatesResponse } from "@/lib/coinlayer";

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string | number;
  };
}

// Success response is handled by the return type of coinlayerFetch

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from")?.toUpperCase();
    const to = searchParams.get("to")?.toUpperCase();
    const amount = searchParams.get("amount");
    const date = searchParams.get("date") ?? undefined;

    if (!from || !to || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Missing required params: from, to, amount" },
        },
        { status: 400 }
      );
    }

    // Try native Coinlayer convert first (Basic plan+)
    try {
      const data: ConvertResponse = await coinlayerFetch("/convert", {
        from,
        to,
        amount,
        date,
      });
      return NextResponse.json(data, { status: 200 });
    } catch (apiErr: unknown) {
      const error = apiErr as Error;
      const errorMessage = error?.message || 'Unknown error occurred';

      // Fallback for free plan: compute using live USD rates
      // Supported:
      // - crypto -> crypto: amount * (USD_rate(to) / USD_rate(from))
      // - crypto -> USD: amount * USD_rate(from)
      // Not supported without paid target: crypto -> non-USD fiat
      const amt = Number(amount);
      if (!isFinite(amt) || amt <= 0) {
        return NextResponse.json(
          { success: false, error: { message: "Invalid amount" } },
          { status: 400 }
        );
      }

      if (to === "USD") {
        const live = await coinlayerFetch<LiveRatesResponse>("/live", { symbols: from });
        const rate = live?.rates?.[from];
        const r = typeof rate === "number" ? rate : rate?.rate;
        if (!r) {
          return NextResponse.json(
            { success: false, error: { message: `No live rate for ${from}` } },
            { status: 400 }
          );
        }
        const result = amt * r;
        return NextResponse.json(
          {
            success: true,
            query: { from, to, amount: amt },
            info: { timestamp: live?.timestamp, rate: r },
            result,
            note: "Computed using live USD rate (fallback)",
          },
          { status: 200 }
        );
      }

      // crypto -> crypto via USD cross
      const symbols = `${from},${to}`;
      const live = await coinlayerFetch<LiveRatesResponse>("/live", { symbols });
      const rateFrom = live?.rates?.[from];
      const rateTo = live?.rates?.[to];
      const rf = typeof rateFrom === "number" ? rateFrom : rateFrom?.rate;
      const rt = typeof rateTo === "number" ? rateTo : rateTo?.rate;

      if (rf && rt) {
        const result = amt * (rt / rf);
        return NextResponse.json(
          {
            success: true,
            query: { from, to, amount: amt },
            info: { timestamp: live?.timestamp, rate: rt / rf },
            result,
            note: "Computed using live USD cross rates (fallback)",
          },
          { status: 200 }
        );
      }

      // Unsupported: crypto -> non-USD fiat on free plan
      return NextResponse.json(
        {
          success: false,
          error: {
            message: errorMessage,
            code: 'UNSUPPORTED_CONVERSION'
          },
        } as ErrorResponse,
        { status: 402 }
      );
    }
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
