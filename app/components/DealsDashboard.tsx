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
        setStatus(`Found ${data.deals_found} deals. Sent ${data.deals_sent} to ${email}.`);
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
    <div className="flex h-screen w-full bg-[#0a0a0a] text-gray-300 font-mono text-sm overflow-hidden selection:bg-teal-500/30">

      {/* LEFT SIDEBAR: HISTORY */}
      <div className="w-64 border-r border-[#222] flex flex-col bg-[#0f0f0f]">
        <div className="h-12 border-b border-[#222] flex items-center px-4 font-bold tracking-wider text-xs text-gray-500">
          HISTORY
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.length === 0 ? (
            <div className="text-gray-600 px-2 py-4 italic text-xs">No runs yet</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="px-3 py-2 hover:bg-[#1a1a1a] rounded cursor-pointer text-gray-400 group transition-colors">
                <div className="text-white font-medium">Run #{history.length - i}</div>
                <div className="text-xs text-gray-600 flex justify-between mt-1">
                  <span>{h.date}</span>
                  <span className="text-teal-500">{h.count} deals</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-[#222] text-[10px] text-gray-600 uppercase tracking-widest text-center">
          Vinted AI Hunter v1.0
        </div>
      </div>

      {/* CENTER: SOURCE / CONFIGURATION */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#222] bg-[#0a0a0a]">

        {/* Breadcrumb / Header */}
        <div className="h-12 border-b border-[#222] flex items-center px-6 text-teal-500 font-medium tracking-wide">
          <span className="text-gray-600 mr-2">TOOL /</span> VINTED_DEAL_FINDER
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-8">

            <div className="border border-[#222] p-6 rounded bg-[#0f0f0f]">
              <div className="text-xs font-bold text-gray-500 mb-6 tracking-widest uppercase border-b border-[#222] pb-2">Configuration</div>

              <div className="space-y-6">

                {/* Email Input */}
                <div className="group">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-teal-500 transition-colors">Target Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter recipient email..."
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded px-4 py-3 text-white focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none transition-all placeholder:text-gray-700 font-sans"
                  />
                </div>

                {/* Brand Selector */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-3">Filter Brands (Optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_BRANDS.map(brand => (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all ${selectedBrands.includes(brand)
                            ? "bg-teal-500/10 border-teal-500/50 text-teal-400"
                            : "bg-[#111] border-[#333] text-gray-500 hover:border-gray-500 hover:text-gray-300"
                          }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Results Slider */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500">Deal Limit</label>
                    <span className="text-teal-500 font-bold">{maxResults}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={maxResults}
                    onChange={(e) => setMaxResults(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>

              </div>
            </div>

            {/* Drag & Drop Visual (Static for now to match aesthetic) */}
            <div className="border border-dashed border-[#222] rounded h-32 flex flex-col items-center justify-center text-gray-600 hover:border-teal-500/30 hover:bg-teal-900/5 transition-colors cursor-default select-none group">
              <span className="text-2xl mb-2 group-hover:text-teal-500 transition-colors">+</span>
              <span className="text-[10px] tracking-widest uppercase">ADDITIONAL PARAMETERS (DRAG & DROP)</span>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="h-20 border-t border-[#222] flex items-center justify-center px-8 bg-[#0a0a0a]">
          <button
            onClick={handleRun}
            disabled={loading}
            className={`w-full max-w-md py-3 rounded border font-medium tracking-widest text-xs transition-all uppercase ${loading
                ? "bg-[#111] border-[#333] text-gray-500 cursor-wait"
                : "bg-white text-black border-white hover:bg-gray-200 hover:scale-[1.01]"
              }`}
          >
            {loading ? "PROCESSING..." : "RUN EXTRACTION"}
          </button>
        </div>
      </div>

      {/* RIGHT: OUTPUT */}
      <div className="w-[500px] bg-[#0c0c0c] flex flex-col border-l border-[#222]">
        <div className="h-12 border-b border-[#222] flex items-center justify-between px-4 font-bold tracking-wider text-xs text-gray-500">
          <span>OUTPUT / PREVIEW</span>
          {preview && <button onClick={() => setPreview(null)} className="hover:text-white transition-colors">CLEAR</button>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 relative bg-[#0c0c0c]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
              <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
              <div className="text-teal-500 text-xs tracking-widest animate-pulse">ANALYZING MARKET DATA...</div>
            </div>
          ) : !preview ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-800 space-y-4 select-none">
              <span className="text-6xl font-thin opacity-20">?</span>
              <span className="text-[10px] tracking-widest uppercase font-bold opacity-40">WAITING FOR INPUT</span>
            </div>
          ) : (
            <div className="w-full h-full bg-white rounded-sm overflow-hidden shadow-2xl relative group">
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={`data:text/html;charset=utf-8,${encodeURIComponent(preview)}`} download="deals.html" className="bg-black text-white text-[10px] px-2 py-1 rounded shadow hover:bg-teal-600">DOWNLOAD</a>
              </div>
              <iframe
                srcDoc={preview}
                className="w-full h-full border-none"
                title="Preview"
              />
            </div>
          )}

          {status && !loading && !preview && (
            <div className={`mt-4 p-3 border text-xs text-center rounded ${status.includes("Error")
                ? "border-red-900/30 bg-red-900/10 text-red-400"
                : "border-teal-900/30 bg-teal-900/10 text-teal-400"
              }`}>
              {status}
            </div>
          )}
        </div>

        {/* Latex/Code output styling filler */}
        <div className="h-32 border-t border-[#222] bg-[#080808] p-4 font-mono text-[10px] text-gray-600 overflow-hidden">
          <div className="mb-2 uppercase tracking-wide opacity-50">System Logs</div>
          <div className="opacity-40">
            &gt; System ready.<br />
            {status && <span>&gt; {status}</span>}
          </div>
        </div>
      </div>

    </div>
  );
}
