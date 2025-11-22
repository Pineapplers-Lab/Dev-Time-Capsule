import React, { useState } from 'react';
import { Search, ArrowRight, ShieldAlert, Terminal, Bot, Code2 } from 'lucide-react';

export const IntakeView = ({ onAnalyze }: { onAnalyze: (url: string) => void }) => {
  const [url, setUrl] = useState("");
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto px-6 animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center">
        <div className="h-16 w-16 bg-slate-900 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-slate-200">
          <Code2 className="text-white h-8 w-8" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight">RepoLens AI</h1>
        <p className="text-slate-500 text-lg">Deep scan for security, startup issues, and AI-guided walkthroughs.</p>
      </div>
      <div className="w-full relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
        <input
          type="text"
          placeholder="github.com/username/repository"
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-slate-200 focus:outline-none shadow-sm text-lg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && url && onAnalyze(url)}
        />
        <button onClick={() => url && onAnalyze(url)} className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 rounded-xl flex items-center justify-center">
          <ArrowRight className="text-white h-5 w-5" />
        </button>
      </div>
    </div>
  );
};