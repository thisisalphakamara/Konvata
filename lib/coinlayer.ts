// Coinlayer endpoints are served under the '/api' path segment (e.g., /api/live)
const COINLAYER_BASE = "https://api.coinlayer.com/api";

// Type definitions for Coinlayer API responses
interface CoinlayerError {
  code: number;
  type: string;
  info: string;
}

interface CoinlayerResponse {
  success: boolean;
  error?: CoinlayerError;
  terms?: string;
  privacy?: string;
}

interface LiveRatesResponse extends CoinlayerResponse {
  timestamp: number;
  target: string;
  rates: Record<string, number | { rate: number; high?: number; low?: number; vol?: number; cap?: number; sup?: number }>;
}

interface ConvertResponse extends CoinlayerResponse {
  query: {
    from: string;
    to: string;
    amount: number;
  };
  info: {
    timestamp: number;
    rate: number;
  };
  result: number;
  historical?: boolean;
  date?: string;
}

function getApiKey(): string {
  const key = process.env.COINLAYER_API_KEY;
  if (!key) {
    throw new Error("Missing COINLAYER_API_KEY environment variable. Create a .env.local with COINLAYER_API_KEY=your_key");
  }
  return key;
}

export async function coinlayerFetch<T = unknown>(
  path: string, 
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const access_key = getApiKey();
  const search = new URLSearchParams();
  search.set("access_key", access_key);
  
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    search.set(k, String(v));
  }
  
  const url = `${COINLAYER_BASE}${path}?${search.toString()}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  
  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`);
  }
  
  const data: CoinlayerResponse = await res.json();
  
  if (data && data.success === false) {
    const info = data.error?.info || "Unknown Coinlayer API error";
    const code = data.error?.code;
    throw new Error(`Coinlayer API error (${code}): ${info}`);
  }
  
  return data as T;
}

export type { LiveRatesResponse, ConvertResponse };
