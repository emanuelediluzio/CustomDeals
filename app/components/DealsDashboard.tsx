"use client";

import React, { useState } from 'react';

export default function DealsDashboard() {
  const [email, setEmail] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleRun = async () => {
    if (!email) return alert("Please enter an email");
    setLoading(true);
    setStatus("Scraping Vinted catalogs (IT/FR/DE)...");
    
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipient_email: email, 
          max_results: maxResults,
          filters: {} 
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setStatus(`Found ${data.deals_found} deals. Sent top ${data.deals_sent} to ${email}.`);
        setPreview(data.preview_html);
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
    <div className="min-h-screen bg-neutral-900 text-white font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
            Vinted AI Hunter
          </h1>
          <p className="text-neutral-400 text-lg">
            Daily deal finder for Italy, France, and Germany using Gemini AI
          </p>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Settings Card */}
          <div className="bg-neutral-800/50 backdrop-blur border border-neutral-700 p-6 rounded-2xl shadow-xl hover:shadow-teal-500/10 transition-all">
            <h2 className="text-xl font-bold mb-4 flex items-center text-teal-400">
              <span className="mr-2">⚙️</span> Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Send Notifications To</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Max Deals to Send</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    step="5"
                    value={maxResults}
                    onChange={(e) => setMaxResults(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <span className="bg-neutral-900 px-3 py-1 rounded border border-neutral-700 text-teal-400 font-mono">
                    {maxResults}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                 <label className="block text-sm text-neutral-400 mb-2">Notification Channel</label>
                 <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/50 text-sm font-medium">Email</button>
                    <button className="flex-1 py-2 rounded-lg bg-neutral-800 text-neutral-500 border border-neutral-700 text-sm font-medium cursor-not-allowed" title="Coming Soon">WhatsApp</button>
                 </div>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-neutral-800/50 backdrop-blur border border-neutral-700 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-purple-400">
                <span className="mr-2">🚀</span> Actions
              </h2>
              <p className="text-neutral-400 text-sm mb-6">
                Manually trigger the scraper now. Use this to test your configuration or get instant updates.
              </p>
            </div>

            <button
              onClick={handleRun}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                loading 
                  ? "bg-neutral-700 text-neutral-400 cursor-wait" 
                  : "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-teal-500/25"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Run Analysis Now"}
            </button>
          </div>
        </div>

        {/* Status Area */}
        {status && (
          <div className={`p-4 rounded-xl text-center border ${
            status.includes("Error") || status.includes("Failed") 
              ? "bg-red-500/10 border-red-500/30 text-red-200" 
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
          }`}>
            {status}
          </div>
        )}

        {/* Preview Area */}
        {preview && (
           <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
             <div className="bg-gray-100 p-3 border-b border-gray-200 flex justify-between items-center text-gray-500 text-sm">
               <span>Email Preview</span>
               <button onClick={() => setPreview(null)} className="hover:text-red-500">Close</button>
             </div>
             <iframe 
                srcDoc={preview} 
                className="w-full h-[600px] border-none"
                title="Email Preview"
             />
           </div>
        )}

      </div>
    </div>
  );
}
