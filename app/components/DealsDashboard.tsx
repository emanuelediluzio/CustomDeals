"use client";

import React, { useState, useEffect } from 'react';

// Using a refined list of brands
const SUGGESTED_BRANDS = [
  "Nike", "Adidas", "Zara", "Ralph Lauren", "Levi's", "Carhartt WIP",
  "The North Face", "Patagonia", "Stone Island", "Gucci", "Prada", "Stüssy"
];

export default function DealsDashboard() {
  const [email, setEmail] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState<{ date: string, count: number, id: string }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleRun = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please check your email address.");
      return;
    }

    setLoading(true);
    setStatus("Searching catalogs...");

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: email,
          max_results: maxResults,
          filters: { brands: selectedBrands }
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setStatus(`Success! Found ${data.deals_found} deals.`);
        setPreview(data.preview_html);
        setHistory(prev => [{
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          count: data.deals_sent,
          id: Math.random().toString(36).substr(2, 6).toUpperCase()
        }, ...prev]);
      } else {
        setStatus("Error: " + JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
      setStatus("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null; // Prevents hydration mismatch

  return (
    <div className="flex h-screen w-full bg-[#030712] text-slate-200 bg-grid-pattern overflow-hidden selection:bg-indigo-500/30">

      {/* 1. SIDEBAR: Glass Panel */}
      <div className="w-72 glass border-r-0 flex flex-col z-10 m-3 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-16 flex items-center px-6 border-b border-white/5 bg-white/5 mx-2 mt-2 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30">
              <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-sm font-semibold tracking-wide text-white">Run History</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 opacity-40 text-center px-4">
              <p className="text-sm font-medium">No Runs Yet</p>
              <p className="text-xs mt-1">Your search history will appear here.</p>
            </div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="group p-3.5 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/5 hover:border-indigo-500/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className="text-xs font-bold text-white tracking-wide">RUN #{history.length - i}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-black/20 px-1.5 py-0.5 rounded">{h.id}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 relative z-10">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {h.date}
                  </span>
                  <span className="text-indigo-300 font-medium">{h.count} items</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. MAIN: Configuration */}
      <div className="flex-1 flex flex-col min-w-0 m-3 ml-0 rounded-2xl glass overflow-hidden relative shadow-2xl">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <div className="h-20 flex items-center justify-between px-10 border-b border-white/5 z-10">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Vinted Deal Finder</h1>
            <p className="text-xs text-slate-400 mt-0.5">Automated arbitrage & deal analysis tool</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-semibold text-indigo-300 tracking-wide uppercase">System Active</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 z-10">
          <div className="max-w-2xl mx-auto space-y-12">

            {/* 1. Recipient */}
            <div className="relative group">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Recipient</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-lg text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:bg-slate-900/80 outline-none transition-all shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">ENTER to confirm</span>
                </div>
              </div>
            </div>

            {/* 2. Volume Slider */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Result Limit</label>
                <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                  {maxResults} DEALS
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-3 font-medium uppercase tracking-widest">
                <span>Min (5)</span>
                <span>Max (50)</span>
              </div>
            </div>

            {/* 3. Brands */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 block">Brand Filtering</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {SUGGESTED_BRANDS.map(brand => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`text-xs font-medium px-4 py-3 rounded-lg border transition-all duration-200 relative overflow-hidden group ${selectedBrands.includes(brand)
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    {selectedBrands.includes(brand) && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_1s_infinite]"></span>
                    )}
                    {brand}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-white/5 z-10 bg-slate-950/30 backdrop-blur-md flex justify-center">
          <button
            onClick={handleRun}
            disabled={loading}
            className={`relative w-full max-w-lg h-14 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-xl overflow-hidden ${loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/25 hover:scale-[1.01] border border-white/10"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                PROCESSING REQUEST...
              </span>
            ) : (
              "START ANALYSIS AGENT"
            )}
          </button>
        </div>
      </div>

      {/* 3. RIGHT: Output/Preview */}
      <div className="w-[480px] m-3 ml-0 rounded-2xl glass overflow-hidden relative shadow-2xl flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-white/5">
          <span className="text-sm font-bold text-slate-300">Live Preview</span>
          {preview && (
            <button
              onClick={() => setPreview(null)}
              className="text-xs font-semibold text-slate-500 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10"
            >
              CLEAR
            </button>
          )}
        </div>

        <div className="flex-1 relative bg-black/20">
          {loading && (
            <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center space-y-4 backdrop-blur-sm">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-xs font-bold text-indigo-400 animate-pulse tracking-widest">{status}</p>
            </div>
          )}

          {!preview ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-600 select-none">
              <div className="w-20 h-20 rounded-3xl bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-6 shadow-inner">
                <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <p className="text-sm font-medium text-slate-500">Ready to Analyze</p>
              <p className="text-xs text-slate-600 mt-2 max-w-[200px] leading-relaxed">Configure your search parameters and launch the agent to see live results here.</p>
            </div>
          ) : (
            <iframe
              srcDoc={preview}
              className="w-full h-full border-none bg-white"
              title="Preview"
            />
          )}
        </div>
      </div>

    </div>
  );
}
