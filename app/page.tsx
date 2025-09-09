"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import ThemeToggle from "@/app/components/ThemeToggle";
import { useToast } from "@/app/components/Toast";

// Dynamically import the HistoricalChart component to avoid SSR issues with Chart.js
const HistoricalChart = dynamic(
  () => import("@/app/components/HistoricalChart"),
  { ssr: false }
);

type SymbolMap = Record<string, { symbol: string; name: string; name_full: string; max_supply?: number; icon_url?: string }>;
type FiatMap = Record<string, string>; // e.g., { USD: "United States Dollar" }

type LiveRates = Record<string, number | { rate: number }>;

export default function Home() {
  const { show } = useToast();
  const [symbols, setSymbols] = useState<SymbolMap>({});
  const [fiat, setFiat] = useState<FiatMap>({});
  const [popular, setPopular] = useState<string[]>(["BTC", "ETH", "XRP", "ADA", "SOL"]);
  const [target, setTarget] = useState<string>("USD");
  const [live, setLive] = useState<LiveRates>({});
  const [loadingLive, setLoadingLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [maxShow, setMaxShow] = useState<number>(30);
  const [liveSearch, setLiveSearch] = useState<string>("");
  
  // Historical data modal state
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [showHistoricalData, setShowHistoricalData] = useState<boolean>(false);
  
  // Open historical data modal
  const openHistoricalData = (symbol: string) => {
    setSelectedCrypto(symbol);
    setShowHistoricalData(true);
  };
  
  // Close historical data modal
  const closeHistoricalData = () => {
    setShowHistoricalData(false);
    setSelectedCrypto(null);
  };

  const [from, setFrom] = useState<string>("BTC");
  const [to, setTo] = useState<string>("ETH");
  const [amount, setAmount] = useState<string>("1");
  const [convResult, setConvResult] = useState<number | null>(null);
  const [convLoading, setConvLoading] = useState<boolean>(false);
  const [convError, setConvError] = useState<string | null>(null);

  // Load symbols once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/symbols");
        const data = await res.json();
        if (data?.success && data?.crypto) {
          setSymbols(data.crypto as SymbolMap);
          if (data?.fiat) setFiat(data.fiat as FiatMap);
        } else {
          throw new Error(data?.error?.message || "Failed to load symbols");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load symbols");
      }
    })();
  }, []);

  // Load live rates for popular symbols
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingLive(true);
        setError(null);
        const url = showAll
          ? `/api/live?target=${encodeURIComponent(target)}&expand=1`
          : `/api/live?target=${encodeURIComponent(target)}&symbols=${popular.join(",")}&expand=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.success && data?.rates) {
          setLive(data.rates as LiveRates);
        } else {
          throw new Error(data?.error?.message || "Failed to load live rates");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load live rates");
      } finally {
        setLoadingLive(false);
      }
    };
    load();
  }, [target, popular, showAll]);

  const cryptoList = useMemo(() => Object.keys(symbols).sort(), [symbols]);
  const fiatList = useMemo(() => Object.keys(fiat).sort(), [fiat]);

  // Add symbol to popular list
  const [addSymbol, setAddSymbol] = useState<string>("BTC");
  const [showAddToast, setShowAddToast] = useState<{show: boolean, symbol: string, isNew: boolean} | null>(null);

  useEffect(() => {
    if (showAddToast?.show) {
      show(
        showAddToast.isNew 
          ? `${showAddToast.symbol} added to list` 
          : `${showAddToast.symbol} is already in the list`,
        showAddToast.isNew ? "success" : "info"
      );
      setShowAddToast(null);
    }
  }, [showAddToast, show]);

  const handleAddPopular = () => {
    if (!addSymbol) return;
    setPopular((prev) => {
      const isNew = !prev.includes(addSymbol);
      const next = isNew ? [...prev, addSymbol] : prev;
      setShowAddToast({ show: true, symbol: addSymbol, isNew });
      return next;
    });
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setConvLoading(true);
      setConvError(null);
      setConvResult(null);
      const url = `/api/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.success && typeof data?.result === "number") {
        setConvResult(data.result);
        show(`Converted ${amount} ${from} → ${to}`, "success");
      } else {
        throw new Error(data?.error?.message || "Conversion failed");
      }
    } catch (e: any) {
      setConvError(e?.message || "Conversion failed");
      show(e?.message || "Conversion failed", "error");
    } finally {
      setConvLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:from-[#0b1020] dark:to-[#090f1c] dark:text-slate-100">
      <header className="w-full border-b border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Konvata</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm opacity-70">Target</label>
            <select
              className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-300/60 dark:border-white/10"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {(fiatList.length ? fiatList : ["USD"]).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Live Rates</h2>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
                Show all cryptocurrencies
              </label>
              {showAll && (
                <div className="flex items-center gap-3">
                  <label className="text-sm opacity-70">Max</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={maxShow}
                    onChange={(e) => setMaxShow(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                    className="w-20 px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-300/60 dark:border-white/10"
                  />
                  <input
                    placeholder="Filter symbol (e.g., BTC)"
                    value={liveSearch}
                    onChange={(e) => setLiveSearch(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-300/60 dark:border-white/10"
                  />
                </div>
              )}
            </div>
            {!showAll && (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-sm opacity-70">Add crypto to list</label>
                  <select
                    className="w-full px-3 py-2 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-300/60 dark:border-white/10"
                    value={addSymbol}
                    onChange={(e) => setAddSymbol(e.target.value)}
                  >
                    {(cryptoList.length ? cryptoList : ["BTC", "ETH", "XRP"]).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddPopular}
                    className="inline-flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {loadingLive && (
              <>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-white/5 card">
                    <div className="h-5 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="mt-2 h-3 w-40 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="mt-4 h-8 w-32 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                ))}
              </>
            )}
            {!loadingLive && (showAll ?
              Object.keys(live)
                .filter((s) => !liveSearch || s.includes(liveSearch))
                .sort()
                .slice(0, maxShow)
                .map((sym) => {
                  const entry = live?.[sym] as any;
                  const rate: number = typeof entry === "number" ? entry : entry?.rate;
                  const meta = symbols?.[sym];
                  return (
                    <div 
                      key={sym} 
                      onClick={() => openHistoricalData(sym)}
                      className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-white/5 card hover:translate-y-[-2px] transition-transform cursor-pointer hover:shadow-md dark:hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">{sym}</div>
                          <div className="text-xs opacity-70">{meta?.name || meta?.name_full || ""}</div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Click for history</div>
                      </div>
                      <div className="mt-3 text-2xl font-bold tracking-tight fit-number">
                        {rate ? `${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${target}` : "—"}
                      </div>
                    </div>
                  );
                })
              :
              popular.map((sym) => {
                const entry = live?.[sym] as any;
                const rate: number = typeof entry === "number" ? entry : entry?.rate;
                const meta = symbols?.[sym];
                return (
                  <div 
                    key={sym} 
                    onClick={() => openHistoricalData(sym)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-white/5 hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">{sym}</div>
                        <div className="text-xs opacity-70">{meta?.name || meta?.name_full || ""}</div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Click for history</div>
                    </div>
                    <div className="mt-3 text-2xl font-bold tracking-tight fit-number">
                      {rate ? `${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${target}` : "—"}
                    </div>
                  </div>
                );
              }))}
          </div>
        </section>

        <section className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Converter</h2>
          <form onSubmit={handleConvert} className="rounded-xl border border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-white/5 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm opacity-70">From (Crypto)</label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="px-3 py-2 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-300/60 dark:border-white/10"
                >
                  {(cryptoList.length ? cryptoList : ["BTC", "ETH", "XRP"]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm opacity-70">To (Crypto or Fiat)</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="px-3 py-2 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-300/60 dark:border-white/10"
                >
                  <optgroup label="Fiat">
                    {(fiatList.length ? fiatList : ["USD"]).map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Crypto">
                    {(cryptoList.length ? cryptoList : ["BTC", "ETH", "XRP"]).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm opacity-70">Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="px-3 py-2 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-300/60 dark:border-white/10"
              />
            </div>

            <button
              type="submit"
              disabled={convLoading}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white px-4 py-2 font-medium"
            >
              {convLoading ? "Converting…" : "Convert"}
            </button>

            {convError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">{convError}</div>
            )}

            {convResult !== null && (
              <div className="text-sm">
                Result: <span className="font-semibold">{convResult.toLocaleString()}</span> {to}
              </div>
            )}
          </form>

          <div className="mt-6 text-xs opacity-70">
            Data by Coinlayer. Rates refresh when you change target currency.
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-xs opacity-70">
        © {new Date().getFullYear()} Konvata
      </footer>

      {/* Historical Data Modal */}
      {showHistoricalData && selectedCrypto && (
        <HistoricalChart 
          symbol={selectedCrypto} 
          target={target} 
          onClose={closeHistoricalData} 
        />
      )}
    </div>
  );
}
