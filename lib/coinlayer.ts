// Coinlayer endpoints are served under the '/api' path segment (e.g., /api/live)
const COINLAYER_BASE = "https://api.coinlayer.com/api";

function getApiKey(): string {
  const key = process.env.COINLAYER_API_KEY;
  if (!key) {
    throw new Error("Missing COINLAYER_API_KEY environment variable. Create a .env.local with COINLAYER_API_KEY=your_key");
  }
  return key;
}

export async function coinlayerFetch(path: string, params: Record<string, any> = {}) {
  const access_key = getApiKey();
  const search = new URLSearchParams();
  search.set("access_key", access_key);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    search.set(k, String(v));
  }
  const url = `${COINLAYER_BASE}${path}?${search.toString()}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  let data: any = null;
  try {
    data = await res.json();
  } catch (_) {
    // ignore JSON parse error; we'll handle below
  }
  if (data && data.success === false) {
    const info = data?.error?.info || "Unknown Coinlayer API error";
    const code = data?.error?.code;
    throw new Error(`Coinlayer API error (${code}): ${info}`);
  }
  if (!res.ok) {
    throw new Error(`Coinlayer request failed: ${res.status} ${res.statusText}`);
  }
  return data;
}

export type LiveRatesResponse = {
  success: boolean;
  timestamp: number;
  target: string;
  rates: Record<string, number | { rate: number; high?: number; low?: number; vol?: number; cap?: number; sup?: number }>
};
