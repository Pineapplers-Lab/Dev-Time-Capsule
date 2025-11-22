"use client";
import React, { useState } from 'react';
import { Code2, Box, GitBranch, Bot } from 'lucide-react';
import { RepoAnalysis } from '../types';
import { IntakeView } from '../components/views/IntakeView';
import { DashboardView } from '../components/views/DashboardView';
import { StructureView } from '../components/views/StructureView';
import { TaskWalkthroughView } from '../components/views/TaskWalkthroughView';

// Mock Data Fallback
const MOCK_DATA: RepoAnalysis = {
  repo_id: "github.com/mock/repo",
  environment: { language: "TypeScript", framework: "Next.js", nodeVersion: ">=18", buildSystem: "Turbo" },
  dependencies: [{ name: "react", version: "18.2", type: "prod" }],
  structure: { name: "root", type: "folder", children: [{ name: "src", type: "folder", children: [] }] },
  tasks: ["npm install", "npm run dev"],
  security: [],
  startup_issues: []
};

export default function Home() {
  const [view, setView] = useState<'intake' | 'dashboard' | 'structure' | 'walkthrough'>('intake');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepoAnalysis | null>(null);

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repo_url: url })
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setData(result);
      setView('dashboard');
    } catch (error) {
      console.warn("Backend unavailable. Using mock data.");
      setTimeout(() => { setData({ ...MOCK_DATA, repo_id: url }); setView('dashboard'); setLoading(false); }, 1500);
    } finally { setLoading(false); }
  };

  if (view === 'intake') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
          <div className="flex items-center gap-2"><div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center"><Code2 className="text-white h-5 w-5" /></div><span className="font-semibold text-slate-900">RepoLens</span></div>
        </header>
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {loading ? <div className="absolute inset-0 flex items-center justify-center bg-white z-50">Loading...</div> : <IntakeView onAnalyze={handleAnalyze} />}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-40">
        <div className="h-16 flex items-center px-6 border-b border-slate-100"><div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('intake')}><Code2 className="text-slate-900 h-6 w-6" /><span className="font-semibold text-slate-900">RepoLens</span></div></div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${view === 'dashboard' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}><Box size={18} /> Overview</button>
          <button onClick={() => setView('structure')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${view === 'structure' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}><GitBranch size={18} /> Structure</button>
          <button onClick={() => setView('walkthrough')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${view === 'walkthrough' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}><Bot size={18} /> Assistant</button>
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-8 h-screen overflow-y-auto">
        {view === 'dashboard' && data && <DashboardView data={data} onStartWalkthrough={() => setView('walkthrough')} />}
        {view === 'structure' && data && <StructureView structure={data.structure} />}
        {view === 'walkthrough' && data && <TaskWalkthroughView repoId={data.repo_id} />}
      </main>
    </div>
  );
}