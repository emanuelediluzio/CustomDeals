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
  const [history, setHistory] = useState<{ date: string, count: number }[]>([]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleRun = async () => {
    // Basic Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setStatus("Scraping Vinted catalogs...");
    setPreview(null);

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
        setHistory(prev => [{ date: new Date().toLocaleTimeString(), count: data.deals_sent }, ...prev]);
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
    <div className="flex h-screen w-full bg-[#050505] text-[#ccc] font-mono text-xs overflow-hidden">

      {/* LEFT SIDEBAR: HISTORY */}
      <div className="w-64 border-r border-[#222] flex flex-col bg-[#080808]">
        <div className="h-10 border-b border-[#222] flex items-center px-4 font-bold tracking-widest text-[#666] uppercase">
          History
        </div>
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-4 text-[#444] italic">No prior runs</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="border-b border-[#1a1a1a] p-3 hover:bg-[#111] cursor-pointer transition-colors group">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-bold group-hover:text-emerald-500">RUN_0{history.length - i}</span>
                  <span className="text-[#444]">{h.date}</span>
                </div>
                <div className="text-[#666]">
                  <span className="text-emerald-600 font-bold">{h.count}</span> items extracted
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-[#222] text-[#333] text-[10px] uppercase">
          System: Online
        </div>
      </div>

      {/* CENTER: CONFIGURATION */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#222] bg-[#050505]">

        {/* Header */}
        <div className="h-10 border-b border-[#222] flex items-center px-4 text-emerald-500 font-bold tracking-widest">
          <span className="text-[#444] mr-2">/root/</span>VINTED_EXTRACTOR
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">

          <div className="mb-8">
            <label className="block text-[#555] mb-2 uppercase tracking-widest text-[10px]">1. Target Information</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="RECIPIENT_EMAIL"
              className="w-full bg-[#0a0a0a] border-b border-[#333] py-2 text-white focus:border-emerald-500 outline-none transition-colors placeholder:text-[#333]"
            />
          </div>

          <div className="mb-8">
            <label className="block text-[#555] mb-3 uppercase tracking-widest text-[10px]">2. Output Limit: {maxResults}</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-[#555] mb-3 uppercase tracking-widest text-[10px]">3. Filter Brands</label>
            <div className="grid grid-cols-3 gap-2">
              {SUGGESTED_BRANDS.map(brand => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-2 py-2 text-center border text-[10px] uppercase tracking-wider transition-all ${selectedBrands.includes(brand)
                      ? "bg-emerald-900/20 border-emerald-500/50 text-emerald-400"
                      : "bg-[#0a0a0a] border-[#222] text-[#666] hover:border-[#444] hover:text-[#999]"
                    }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Drop Zone Visual */}
          <div className="border border-dashed border-[#222] h-24 flex items-center justify-center text-[#333] uppercase text-[10px] tracking-widest hover:border-[#444] transition-colors">
            [ Optional Configuration File ]
          </div>

        </div>

        {/* Action Bar */}
        <div className="border-t border-[#222] p-4 bg-[#080808]">
          <button
            onClick={handleRun}
            disabled={loading}
            className={`w-full py-3 border font-bold tracking-widest uppercase transition-all ${loading
                ? "bg-[#111] border-[#333] text-[#444] cursor-wait"
                : "bg-[#0a0a0a] border-white text-white hover:bg-white hover:text-black"
              }`}
          >
            {loading ? ">>> EXECUTING..." : ">>> RUN EXTRACTION"}
          </button>
        </div>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="w-[500px] bg-[#050505] flex flex-col relative">
        <div className="h-10 border-b border-[#222] flex items-center justify-between px-4 text-[#444] uppercase tracking-widest">
          <span>Terminal Output</span>
          {preview && <button onClick={() => setPreview(null)} className="hover:text-white">[CLEAR]</button>}
        </div>

        <div className="flex-1 bg-[#000] p-4 font-mono text-emerald-500/80 overflow-y-auto">
          {!loading && !preview && !status && (
            <div className="text-[#333] mt-20 text-center">
              waiting_for_command...
            </div>
          )}

          {loading && (
            <div className="space-y-1">
              <div>&gt; Initiating sequence...</div>
              <div className="text-emerald-300">&gt; Connecting to remote scrapers...</div>
              <div className="animate-pulse">&gt; Analyzing data packets...</div>
            </div>
          )}

          {status && !loading && (
            <div className="mb-4 text-emerald-400 border-b border-[#222] pb-2">
              &gt; STATUS: {status}
            </div>
          )}

          {preview && (
            <div className="w-full border border-[#222] mt-4">
              <div className="bg-[#111] px-2 py-1 text-[10px] text-[#555] border-b border-[#222]">HTML_PREVIEW_MODE</div>
              <iframe title="preview" srcDoc={preview} className="w-full h-[600px] bg-white border-none filter grayscale hover:grayscale-0 transition-all" />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
