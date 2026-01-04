"use client";

import React, { useState } from 'react';

const SUGGESTED_BRANDS = [
  "Nike", "Adidas", "Zara", "H&M", "Levi's", "Ralph Lauren",
  "Gucci", "Prada", "North Face", "Carhartt", "Patagonia", "Stone Island"
];

export default function DealsDashboard() {
  const [email, setEmail] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState<{ date: string, count: number, id: string }[]>([]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleRun = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setStatus("Initiating search...");

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
        setStatus(`Found ${data.deals_found} deals.`);
        setPreview(data.preview_html);
        setHistory(prev => [{
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          count: data.deals_sent,
          id: Math.random().toString(36).substr(2, 4).toUpperCase()
        }, ...prev]);
      } else {
        setStatus("Error: " + JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
      setStatus("Failed to run analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0e0e0e] text-zinc-200 font-sans selection:bg-white/20">

      {/* 1. SIDEBAR: History */}
      <div className="w-64 border-r border-zinc-800/50 bg-[#0e0e0e] flex flex-col">
        <div className="h-14 border-b border-zinc-800/50 flex items-center px-5">
          <div className="flex items-center gap-2 text-zinc-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-xs font-semibold tracking-wide uppercase">History</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.length === 0 ? (
            <div className="px-4 py-8 text-xs text-zinc-600 text-center">No recent activity</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="group px-3 py-2.5 rounded-md hover:bg-zinc-800/50 cursor-pointer transition-all border border-transparent hover:border-zinc-700/50">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-medium text-zinc-300">Run #{history.length - i}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{h.id}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-500">
                  <span>{h.date}</span>
                  <span className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">{h.count} deals</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            <span className="text-xs text-zinc-500 font-medium">System Operational</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN: Configuration */}
      <div className="flex-1 flex flex-col bg-[#0e0e0e] min-w-0">
        <div className="h-14 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-[#0e0e0e]">
          <h1 className="text-sm font-semibold tracking-tight text-white">Vinted Deal Finder</h1>
          <div className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest border border-zinc-800 px-2 py-1 rounded">Beta v1.0</div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-xl mx-auto space-y-10">

            {/* Section 1 */}
            <div className="space-y-4">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Target Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent border-b border-zinc-800 py-3 text-2xl font-light text-white focus:border-white focus:outline-none transition-colors placeholder:text-zinc-800"
                autoFocus
              />
            </div>

            {/* Section 2 */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Deal Volume</label>
                <span className="text-sm font-medium text-white">{maxResults} items</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Brand Filter</label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_BRANDS.map(brand => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 ${selectedBrands.includes(brand)
                        ? "bg-white text-black border-white font-medium"
                        : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-zinc-800/50 bg-[#0e0e0e] flex justify-center">
          <button
            onClick={handleRun}
            disabled={loading}
            className={`group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md px-8 font-medium text-white transition-all duration-300 w-full max-w-xl ${loading ? "cursor-wait opacity-70" : "hover:bg-white hover:text-black"
              }`}
          >
            <span className={`absolute inset-0 border border-zinc-700 rounded-md transition-all duration-300 ${!loading && "group-hover:border-white"}`}></span>
            <span className="relative flex items-center gap-2">
              {loading && <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {loading ? "PROCESSING REQUEST..." : "RUN ANALYSIS"}
            </span>
          </button>
        </div>
      </div>

      {/* 3. RIGHT: Output/Preview */}
      <div className="w-[500px] border-l border-zinc-800/50 bg-[#0c0c0c] flex flex-col relative shadow-2xl">
        <div className="h-14 border-b border-zinc-800/50 flex items-center justify-between px-6">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Output Preview</span>
          {preview && (
            <button
              onClick={() => setPreview(null)}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden bg-[url('/grid.svg')]">
          {loading && (
            <div className="absolute inset-0 bg-[#0c0c0c]/90 z-10 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin"></div>
              <p className="text-xs font-mono text-zinc-500 animate-pulse">{status}</p>
            </div>
          )}

          {!preview ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-700">
              <div className="w-16 h-16 rounded-2xl border border-dashed border-zinc-800 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-sm font-medium text-zinc-500">No output generated</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-[200px]">Run the analysis to see a preview of the email content here.</p>
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
