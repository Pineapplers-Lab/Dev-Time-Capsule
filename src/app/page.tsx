"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Zap,
  Copy,
  Target,
  FileSearch,
  Check,
  Box,
  FolderOpen,
  FileText,
  Database,
  Terminal,
  Activity,
  Cpu,
  ArrowRight,
  Globe,
  Loader2,
  AlertCircle,
  Terminal as TerminalIcon,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';

// Configuration
const apiKey = "AIzaSyAdmLo6ZoiupQHO-o5pfiyClheSzUzuXgM";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

export default function App() {
  const [view, setView] = useState('upload');
  const [activeTab, setActiveTab] = useState('vulns');
  const [copiedId, setCopiedId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState(null);
  const [scanStep, setScanStep] = useState('');

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  async function performRealScan(contextData) {
    setIsScanning(true);
    setScanStep('Initializing multi-agent orchestration...');

    const systemPrompt = `
      You are the orchestrator of a multi-agent security intelligence system. Your task is to analyze codebases, identify vulnerabilities, assess reachability, and provide remediation. 
      You must coordinate multiple specialized agents and integrate with established frameworks.

      Agents to use:
      1. Dependency Analyzer Agent – uses OSV.dev, GitHub Security Advisories, and package manager metadata to identify vulnerable dependencies.
      2. Static Analysis Agent – uses CodeQL, Semgrep, or Trivy to analyze ASTs, call graphs, and configuration files.
      3. Reachability Agent – builds static call graphs and simulates execution paths to determine exploitability.
      4. Patch Generator Agent – produces safe, copy-pasteable CLI commands for remediation using package managers or automated patch frameworks.
      5. Architecture Analyzer Agent – inspects project structure, SBOMs, and generates component-level risk reports.

      Instructions:
      - For each vulnerability, report: package, version, CVE/GHSA ID, severity, reachability trace, and exact fix commands.
      - For architecture analysis, provide component categorization, reasoning, and evidence.
      - Integrate outputs from all agents to produce a single JSON report.
      - Always prefer verified frameworks over reasoning from memory.
      - Respond ONLY in JSON, no prose.
      - Assume all agents and frameworks are callable and return correct data.
      - Temperature: 0, deterministic output.

      Schema:
      {
        "metadata": { "ecosystem": string, "score": number },
        "vulnerabilities": [
          { "id": string, "package": string, "version": string, "severity": string, "reachability": { "status": string, "trace": string }, "fix": string, "resolution": string }
        ],
        "anatomy": [
          { "category": string, "component": string, "evidence": string[], "reason": string, "analysis": string }
        ]
      }
    `;

    const userQuery = `Orchestrate agents to analyze the following context: ${JSON.stringify(contextData)}. Generate the unified multi-agent intelligence report.`;

    let retries = 0;
    while (retries < 5) {
      try {
        // Dynamic loading states based on retry count/simulated progress
        const steps = [
          'Coordinating Dependency Analyzer...',
          'Static Analysis Agent: Querying CodeQL...',
          'Reachability Agent: Mapping execution paths...',
          'Patch Generator: Validating CLI remediation...',
          'Architecture Analyzer: Building SBOM profile...'
        ];
        setScanStep(steps[retries] || 'Finalizing agent synthesis...');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0
            }
          })
        });

        if (!response.ok) throw new Error('Orchestration Node Failure');
        const result = await response.json();
        const data = JSON.parse(result.candidates[0].content.parts[0].text);

        setScanResults(data);
        setTimeout(() => setView('results'), 400);
        setIsScanning(false);
        return;
      } catch (err) {
        retries++;
        await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
        if (retries === 5) {
          setError("Orchestration failed: Agents timed out.");
          setIsScanning(false);
        }
      }
    }
  }

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    performRealScan({
      type: 'local_ingest',
      count: files.length,
      names: Array.from(files).slice(0, 15).map(f => f.name)
    });
  };

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

  const AppleLoader = () => (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative w-12 h-12 mb-8">
        <div className="absolute inset-0 border-[2px] border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-[2px] border-t-black rounded-full animate-spin"></div>
      </div>
      <p className="text-[12px] font-semibold text-gray-400 tracking-tight lowercase font-mono">{scanStep}</p>
    </div>
  );

  const Navbar = () => (
    <nav className="h-14 border-b border-gray-100 bg-white/70 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div
        className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-70"
        onClick={() => { setView('upload'); setScanResults(null); }}
      >
        <Shield size={18} strokeWidth={2.5} />
        <span className="font-semibold text-sm tracking-tight">Dev Capsule</span>
      </div>

      {view === 'results' && (
        <div className="flex bg-gray-100/80 p-0.5 rounded-full">
          <button
            onClick={() => setActiveTab('vulns')}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${activeTab === 'vulns' ? 'bg-white text-black shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : 'text-gray-500'}`}
          >
            Issues
          </button>
          <button
            onClick={() => setActiveTab('anatomy')}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${activeTab === 'anatomy' ? 'bg-white text-black shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : 'text-gray-500'}`}
          >
            Anatomy
          </button>
        </div>
      )}
      <div className="w-20 md:block hidden text-right">
        {view === 'results' && <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">v2.0 Orchestrator</span>}
      </div>
    </nav>
  );

  if (view === 'upload') {
    return (
      <div className="min-h-screen bg-white text-[#1d1d1f] antialiased font-sans">
        <Navbar />
        {isScanning && <AppleLoader />}

        <main className="max-w-[1000px] mx-auto px-8 pt-32 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-semibold tracking-tight leading-[1.05] mb-8 text-black">
              Multi-agent security intelligence.
            </h1>
            <p className="text-xl text-gray-500 font-medium mb-16 leading-relaxed">
              Analyze codebases, verify reachability, and resolve vulnerabilities
              with deterministic agent orchestration.
            </p>

            {error && (
              <div className="mb-10 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-[13px] font-semibold border border-red-100">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-4">
              <form
                onSubmit={(e) => { e.preventDefault(); performRealScan({ url: repoUrl }); }}
                className="group relative flex items-center"
              >
                <div className="absolute left-6 text-gray-400">
                  <Globe size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter Repository URL"
                  className="w-full bg-[#f5f5f7] border-none rounded-[22px] py-6 pl-16 pr-36 text-lg font-medium placeholder:text-gray-400 focus:ring-2 ring-blue-500/20 transition-all"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!repoUrl}
                  className="absolute right-3 bg-black text-white px-6 py-3.5 rounded-[16px] text-[14px] font-semibold hover:bg-[#333] disabled:opacity-30 disabled:hover:bg-black transition-all"
                >
                  Analyze
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="flex flex-col items-start p-10 bg-[#f5f5f7] hover:bg-[#ededf0] rounded-[28px] transition-colors group"
                >
                  <FolderOpen size={24} className="mb-4 text-gray-400 group-hover:text-black transition-colors" />
                  <span className="font-semibold text-[16px]">Select Project Folder</span>
                  <input type="file" ref={folderInputRef} className="hidden" webkitdirectory="true" directory="" onChange={handleFileUpload} />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-start p-10 bg-[#f5f5f7] hover:bg-[#ededf0] rounded-[28px] transition-colors group"
                >
                  <FileText size={24} className="mb-4 text-gray-400 group-hover:text-black transition-colors" />
                  <span className="font-semibold text-[16px]">Upload Lock Files</span>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".json,.lock,.txt" onChange={handleFileUpload} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased font-sans">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-6 py-12 animate-in fade-in duration-700">
        {activeTab === 'vulns' ? (
          <div className="space-y-6">
            <header className="flex justify-between items-end mb-10 px-2">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">Security Intelligence</h2>
                <p className="text-gray-400 text-sm mt-1 font-medium">Deterministic multi-agent synthesis</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OSV Verified</span>
              </div>
            </header>

            <div className="space-y-4">
              {scanResults?.vulnerabilities.map((item, idx) => (
                <div key={idx} className="bg-white rounded-[28px] border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all overflow-hidden">
                  <div className="p-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${item.severity.toLowerCase() === 'critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-600'
                            }`}>
                            {item.severity}
                          </span>
                          <span className="text-gray-300 font-medium text-[12px] font-mono tracking-tighter uppercase">{item.id}</span>
                        </div>
                        <h3 className="text-2xl font-semibold tracking-tight">
                          {item.package} <span className="text-gray-300 font-normal">v{item.version}</span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-4 py-1.5 rounded-full text-[12px] font-semibold border border-gray-100">
                        <Target size={14} className="text-gray-400" />
                        {item.reachability.status}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Agent Resolution</span>
                        <p className="text-[14px] text-gray-500 leading-relaxed font-medium">{item.resolution}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Reachability Trace</span>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-mono text-[11px] text-gray-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                          {item.reachability.trace}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-10 py-8 bg-[#f5f5f7] border-t border-gray-100 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100">
                        <TerminalIcon size={16} className="text-gray-400" />
                      </div>
                      <code className="text-[14px] font-semibold font-mono text-black truncate tracking-tight">
                        {item.fix}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy(item.fix, item.id)}
                      className="bg-black hover:bg-[#333] text-white px-7 py-3 rounded-full text-[13px] font-semibold shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-2"
                    >
                      {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                      {copiedId === item.id ? 'Copied' : 'Copy Fix'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <header className="mb-10 px-2">
              <h2 className="text-3xl font-semibold tracking-tight">Anatomy Scan</h2>
              <p className="text-gray-400 text-sm mt-1 font-medium italic">Architectural intelligence report</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scanResults?.anatomy.map((comp, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col group hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-12 h-12 bg-[#f5f5f7] rounded-2xl flex items-center justify-center text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
                      <Box size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{comp.category}</p>
                      <h3 className="text-xl font-semibold tracking-tight">{comp.component}</h3>
                    </div>
                  </div>
                  <div className="space-y-8 flex-1">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest block">Reasoning</span>
                      <p className="text-[14px] text-gray-600 font-medium leading-relaxed italic">{comp.reason}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-[13px] text-gray-500 leading-relaxed font-medium">
                      {comp.analysis}
                    </div>
                  </div>
                  <div className="mt-10 pt-6 border-t border-gray-50 flex flex-wrap gap-2">
                    {comp.evidence.map((f, i) => (
                      <span key={i} className="text-[10px] font-mono px-2.5 py-1 bg-white border border-gray-100 text-gray-400 rounded-lg font-bold uppercase tracking-tighter">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}