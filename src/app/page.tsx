"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  Shapes,
  FolderOpen,
  FileCode,
  Globe,
  AlertCircle,
  Terminal as TerminalIcon,
  UserPlus,
  Rocket,
  Info,
  ListChecks,
  BookOpen,
  Layout,
  Cpu,
  ShieldAlert,
  Fingerprint,
  ArrowUpRight,
  Code,
  Activity
} from 'lucide-react';


const apiKey = "AIzaSyAdmLo6ZoiupQHO-o5pfiyClheSzUzuXgM";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

export default function App() {
  const [view, setView] = useState('upload');
  const [activeTab, setActiveTab] = useState('onboarding');
  const [copiedId, setCopiedId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState(null);
  const [scanStep, setScanStep] = useState('');

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const ensureArray = (arr) => Array.isArray(arr) ? arr : [];

  async function performRealScan(contextData) {
    setIsScanning(true);
    setScanStep('Initializing Analysis');
    setError(null);

    const systemPrompt = `
      You are a high-end technical onboarding assistant.
      Provide a clean, sophisticated breakdown of a codebase.
      - "metadata": { "onboarding_score": number }
      - "repo_overview": string
      - "tech_stack": string[]
      - "onboarding_checklist": { task: string, description: string, priority: "High"|"Medium"|"Low" }[]
      - "anatomy": { category: string, component: string, purpose: string, reason_for_use: string, analysis: string, evidence: string[] }[]
      - "vulnerabilities": { package: string, version: string, severity: string, id: string, explanation: string, resolution: string, fix: string, reachability: { status: string, trace: string } }[]
      
      Respond ONLY in valid JSON.
    `;

    const userQuery = `Conduct a pre-onboarding safety audit: ${JSON.stringify(contextData)}. Focus on architectural risks and dependency vulnerabilities.`;

    let retries = 0;
    while (retries < 5) {
      try {
        const steps = ['Reading manifest', 'Mapping dependencies', 'Analyzing logic', 'Simulating reachability', 'Finalizing guide'];
        setScanStep(steps[retries] || 'Compiling report');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
          })
        });

        if (!response.ok) throw new Error('API failure');
        const result = await response.json();

        const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) throw new Error('Empty response from mentor');

        const data = JSON.parse(content);

        // Data Sanitization: Ensure all arrays exist even if model skips them
        const sanitizedData = {
          metadata: data.metadata || { onboarding_score: 0 },
          repo_overview: data.repo_overview || "Analysis complete.",
          tech_stack: ensureArray(data.tech_stack),
          onboarding_checklist: ensureArray(data.onboarding_checklist),
          anatomy: ensureArray(data.anatomy),
          vulnerabilities: ensureArray(data.vulnerabilities)
        };

        setScanResults(sanitizedData);
        setTimeout(() => setView('results'), 400);
        setIsScanning(false);
        return;
      } catch (err) {
        retries++;
        await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
        if (retries === 5) {
          setError("Onboarding analysis interrupted. Please check your connection and try again.");
          setIsScanning(false);
        }
      }
    }
  }

  const handleCopy = (text, id) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const Navbar = () => (
    <nav className="h-14 border-b border-gray-100 bg-white/70 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => { setView('upload'); setScanResults(null); setActiveTab('onboarding'); }}
      >
        <div className="bg-black p-1.5 rounded-lg shadow-sm">
          <ShieldCheck size={16} className="text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-black">OnboardSafe</span>
      </div>

      {view === 'results' && (
        <div className="flex bg-gray-100/60 p-1 rounded-xl border border-gray-200/50">
          {[
            { id: 'onboarding', Icon: UserPlus, label: 'Overview' },
            { id: 'anatomy', Icon: Shapes, label: 'Anatomy' },
            { id: 'vulns', Icon: ShieldAlert, label: 'Security' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              <tab.Icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">v2.2</span>
      </div>
    </nav>
  );

  if (view === 'upload') {
    return (
      <div className="min-h-screen bg-[#FBFBFD] text-black antialiased">
        <Navbar />
        {isScanning && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="flex gap-1.5 mb-6">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.3em]">{scanStep}</p>
          </div>
        )}

        <main className="max-w-[1000px] mx-auto px-8 pt-32">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl font-semibold tracking-tight leading-[1.1] mb-8 text-black">
              Engineering <br /> Onboarding.
            </h1>
            <p className="text-lg text-gray-500 font-medium mb-16 leading-relaxed">
              Identify architectural risks and dependency vulnerabilities before you begin development or deployment.
            </p>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <form
                onSubmit={(e) => { e.preventDefault(); performRealScan({ url: repoUrl }); }}
                className="relative flex items-center group"
              >
                <Globe className="absolute left-5 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="GitHub Repository URL"
                  className="w-full bg-white border border-gray-200 rounded-2xl py-5 pl-14 pr-44 text-sm font-medium focus:border-gray-400 focus:ring-0 transition-all outline-none shadow-sm"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!repoUrl || isScanning}
                  className="absolute right-2 bg-black text-white px-6 py-3 rounded-xl text-xs font-semibold hover:bg-gray-800 disabled:opacity-20 transition-all shadow-lg"
                >
                  Analyze
                </button>
              </form>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all group shadow-sm"
                >
                  <FolderOpen size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                  <span className="text-sm font-semibold text-gray-900">Project Directory</span>
                  <input type="file" ref={folderInputRef} className="hidden" webkitdirectory="true" directory="" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all group shadow-sm"
                >
                  <FileCode size={20} className="text-gray-400 group-hover:text-black transition-colors" />
                  <span className="text-sm font-semibold text-gray-900">Manifest Files</span>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".json,.lock,.txt,.yml,.yaml" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-black antialiased">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-8 py-16 animate-in fade-in duration-1000">
        {activeTab === 'onboarding' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <div className="flex items-center gap-2 mb-6 text-gray-400">
                    <Fingerprint size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Project Identity</span>
                  </div>
                  <h2 className="text-4xl font-semibold tracking-tight mb-6">Repository Overview</h2>
                  <p className="text-xl text-gray-500 font-medium leading-relaxed">
                    {scanResults?.repo_overview || "Project overview pending..."}
                  </p>
                </section>

                <section className="bg-white p-10 rounded-[32px] border border-gray-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <ListChecks size={18} className="text-black" />
                      <h3 className="text-lg font-semibold">Action Plan</h3>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500">Day 1</span>
                  </div>
                  <div className="grid gap-4">
                    {ensureArray(scanResults?.onboarding_checklist).length > 0 ? (
                      ensureArray(scanResults?.onboarding_checklist).map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-5 bg-[#FBFBFD] rounded-2xl border border-gray-100 group">
                          <div className={`mt-1 h-4 w-4 rounded-full border flex-shrink-0 ${item.priority === 'High' ? 'border-black bg-black' : 'border-gray-200'}`}></div>
                          <div>
                            <p className="text-sm font-semibold text-black mb-1">{item.task}</p>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No tasks identified.</p>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-black p-8 rounded-[32px] text-white">
                  <BookOpen size={20} className="mb-4 text-gray-400" />
                  <h4 className="text-lg font-semibold mb-3 tracking-tight">Mentorship Note</h4>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                    Automated checks verify codebase safety by mapping known vulnerabilities to the current architecture.
                  </p>
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Safety Score</span>
                      <span className="text-2xl font-semibold">{scanResults?.metadata?.onboarding_score ?? 0}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${scanResults?.metadata?.onboarding_score ?? 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-gray-200/60 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {ensureArray(scanResults?.tech_stack).length > 0 ? (
                      ensureArray(scanResults?.tech_stack).map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-50 text-[10px] font-semibold rounded-lg border border-gray-100">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400">Discovering stack...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anatomy' && (
          <div className="grid md:grid-cols-2 gap-6">
            {ensureArray(scanResults?.anatomy).length > 0 ? (
              ensureArray(scanResults?.anatomy).map((comp, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm flex flex-col group transition-all hover:border-black/20 hover:shadow-md">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                        <Layout size={18} />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{comp.category}</span>
                        <h3 className="text-base font-semibold text-black">{comp.component}</h3>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-black leading-snug">{comp.purpose}</p>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">{comp.reason_for_use}</p>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-[12px] text-gray-500 leading-relaxed font-medium">
                      {comp.analysis}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex flex-wrap gap-2">
                    {ensureArray(comp.evidence).map((f, i) => (
                      <span key={i} className="text-[9px] font-mono px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md font-bold uppercase">{f}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white border border-gray-100 rounded-[32px]">
                <p className="text-gray-400 italic">Architecture analysis pending...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vulns' && (
          <div className="space-y-4">
            {ensureArray(scanResults?.vulnerabilities).length > 0 ? (
              ensureArray(scanResults?.vulnerabilities).map((item, idx) => (
                <div key={idx} className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden transition-all hover:border-black/20">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${item.severity?.toLowerCase() === 'critical' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {item.severity} Risk
                          </span>
                          <span className="text-gray-300 font-mono text-[10px] font-medium tracking-tight uppercase">{item.id}</span>
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight">
                          {item.package} <span className="text-gray-300 font-normal ml-2 text-lg">v{item.version}</span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                        <Activity size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.reachability?.status || 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Info size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Analysis</span>
                          </div>
                          <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Rocket size={12} className="text-black" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Remediation</span>
                          </div>
                          <p className="text-[12px] text-gray-500 font-medium leading-relaxed">{item.resolution}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Code size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Execution Path</span>
                        </div>
                        <div className="bg-[#1A1A1A] p-5 rounded-2xl font-mono text-[11px] text-gray-400 leading-relaxed overflow-x-auto shadow-inner">
                          {item.reachability?.trace || "No execution trace available for this version."}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
                        <TerminalIcon size={14} className="text-black" />
                      </div>
                      <code className="text-xs font-semibold font-mono text-gray-600 truncate max-w-[300px]">
                        {item.fix}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy(item.fix, item.id)}
                      className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                    >
                      {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === item.id ? 'Applied' : 'Apply Patch'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-32 bg-white border border-gray-100 rounded-[32px]">
                <ShieldCheck size={40} className="mx-auto text-emerald-400 mb-4" />
                <p className="text-gray-400 font-medium">No critical security risks identified in current manifests.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}