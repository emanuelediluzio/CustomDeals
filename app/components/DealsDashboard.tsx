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
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);

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
    setStatus("Initiating search agents...");
    setSuccess(false);

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
        setStatus(`Sent ${data.deals_sent} deals to ${email}`);
        setSuccess(true);
      } else {
        setStatus("Error: " + JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
      setStatus("Analysis failed. Please check logs.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen w-full bg-[#030712] text-slate-200 bg-grid-pattern items-center justify-center p-4 selection:bg-indigo-500/30">

      <div className="w-full max-w-2xl relative">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative glass rounded-3xl overflow-hidden shadow-2xl border border-white/10">

          {/* Header */}
          <div className="p-8 pb-0 border-b border-white/5 bg-white/5">
            <h1 className="text-2xl font-bold text-white tracking-tight text-center mb-2">Vinted Deal Finder</h1>
            <p className="text-sm text-slate-400 text-center pb-8">Automated arbitrage & deal analysis tool</p>
          </div>

          <div className="p-10 space-y-10 bg-[#030712]/50 backdrop-blur-md">

            {/* 1. Recipient */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Target Recipient</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-lg text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>

            {/* 2. Volume */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Deal Volume</label>
                <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full">{maxResults} ITEMS</span>
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
            </div>

            {/* 3. Brands */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Brand Filtering</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SUGGESTED_BRANDS.map(brand => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`text-xs font-medium px-2 py-3 rounded-lg border transition-all relative overflow-hidden ${selectedBrands.includes(brand)
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                      }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer / Status */}
          <div className="p-6 border-t border-white/5 bg-white/5 flex flex-col gap-4">

            {status && (
              <div className={`text-center py-2 px-4 rounded-lg text-sm font-medium border ${success
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : loading
                    ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 animate-pulse"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                {status}
              </div>
            )}

            <button
              onClick={handleRun}
              disabled={loading}
              className={`w-full h-14 rounded-xl font-bold tracking-wide transition-all shadow-xl ${loading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/25 hover:scale-[1.01]"
                }`}
            >
              {loading ? "SEARCHING..." : "START SEARCH"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
