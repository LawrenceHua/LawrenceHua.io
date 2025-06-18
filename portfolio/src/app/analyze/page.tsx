import React from 'react';

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-slate-800/70 rounded-xl shadow-lg p-8 border border-slate-700">
        <h1 className="text-4xl font-bold text-white mb-4 text-center">Analytics Dashboard</h1>
        <p className="text-slate-300 text-center mb-8">
          To enable free, privacy-friendly analytics, set up <a href="https://umami.is/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Umami</a> or <a href="https://plausible.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Plausible</a> and embed your dashboard here.<br/>
          <span className="text-slate-400 text-sm">(This placeholder will be replaced with real stats once you connect an analytics provider.)</span>
        </p>
        <div className="flex flex-col gap-6 items-center">
          <div className="w-full h-64 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 text-xl">
            <span>Analytics charts and metrics will appear here.</span>
          </div>
          <div className="w-full h-32 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
            <span>Top pages, referrers, and more...</span>
          </div>
        </div>
        <div className="mt-8 text-center">
          <a href="https://umami.is/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Learn how to self-host Umami for free</a>
        </div>
      </div>
    </div>
  );
} 