import { NextResponse } from "next/server";
import { coinlayerFetch } from "@/lib/coinlayer";

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string | number;
  };
}

interface SymbolInfo {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

interface SymbolsResponse {
  success: boolean;
  terms?: string;
  privacy?: string;
  currencies?: Record<string, SymbolInfo>;
  crypto?: Record<string, SymbolInfo>;
  error?: {
    code: number;
    info: string;
  };
}

export async function GET() {
  try {
    const data = await coinlayerFetch<SymbolsResponse>("/list");
    
    if (!data.success) {
      throw new Error(data.error?.info || "Failed to fetch symbols");
    }
    
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
