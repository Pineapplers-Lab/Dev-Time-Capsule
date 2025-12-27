"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Copy,
  Check,
  Box,
  ShieldAlert,
  Activity,
  Layers,
  Workflow,
  Users,
  Target,
  Terminal,
  Info,
  Database,
  ExternalLink,
  Lock
} from "lucide-react";

const AGENTS = [
  { id: "architect", name: "Architectural Agent", icon: <Layers size={18} />, color: "blue", desc: "Maps structural tiers & stack" },
  { id: "security", name: "Security Sentinel", icon: <Shield size={18} />, color: "red", desc: "Queries OSV.dev & GHSA" },
  { id: "onboarding", name: "DX Specialist", icon: <Users size={18} />, color: "purple", desc: "Builds setup & remediation paths" }
];

type Phase = "upload" | "loading" | "results";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [activeTab, setActiveTab] = useState("overview");
  const [repoUrl, setRepoUrl] = useState("");
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentIdx, setActiveAgentIdx] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const performMultiAgentScan = async (url: string) => {
    setPhase("loading");
    setError(null);
    setActiveAgentIdx(0);

    try {
      const timer = setInterval(() => {
        setActiveAgentIdx(prev => (prev < AGENTS.length - 1 ? prev + 1 : prev));
      }, 2500);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url })
      });

      clearInterval(timer);

      const data = await res.json();
      if (!data.content) throw new Error("No content returned");

      setScanResults(JSON.parse(data.content));
      setPhase("results");
      setActiveTab("overview");
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Multi-agent coordination interrupted.");
      setPhase("upload");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPhase("upload")}>
          <div className="bg-black h-9 w-9 rounded-xl flex items-center justify-center">
            <Box size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Dev Capsule</span>
        </div>

        {phase === "results" && (
          <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
            {["overview", "anatomy", "security"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-1.5 rounded-full text-[12px] font-bold transition-all uppercase tracking-widest ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-black"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <Workflow size={14} /> OSV.DEV ENABLED
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* Upload Phase */}
        {phase === "upload" && (
          <motion.div key="upload" className="max-w-4xl mx-auto pt-32 px-6 text-center space-y-12">
            <h1 className="text-7xl font-bold tracking-tighter leading-tight">
              Autonomous <br /><span className="text-blue-600">Code Intelligence.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-xl mx-auto font-medium">
              Three specialized AI agents auditing architecture and security via OSV.dev and GitHub Advisories.
            </p>

            <div className="relative group max-w-2xl mx-auto">
              <input
                className="w-full bg-white border-2 border-gray-100 rounded-[30px] py-6 px-8 text-lg font-medium shadow-2xl outline-none focus:border-blue-500 transition-all"
                placeholder="Paste repository URL..."
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              <button
                onClick={() => performMultiAgentScan(repoUrl)}
                disabled={!repoUrl}
                className="absolute right-3 top-3 bottom-3 px-8 bg-black text-white rounded-[22px] font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                Start Audit
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-12">
              {AGENTS.map((agent, i) => (
                <div key={i} className="p-6 bg-white border border-gray-100 rounded-[24px] text-left space-y-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${agent.color}-50 text-${agent.color}-600`}>
                    {agent.icon}
                  </div>
                  <h4 className="font-bold text-sm">{agent.name}</h4>
                  <p className="text-xs text-gray-400">{agent.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading Phase */}
        {phase === "loading" && (
          <motion.div key="loading" className="fixed inset-0 bg-white/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-8">
            <div className="w-full max-w-xl space-y-12 text-center">
              <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${((activeAgentIdx + 1) / AGENTS.length) * 100}%` }} className="h-full bg-blue-600" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                {AGENTS.map((agent, i) => (
                  <motion.div key={i} animate={{ scale: activeAgentIdx === i ? 1.05 : 0.95, opacity: activeAgentIdx === i ? 1 : 0.4 }} className={`p-6 rounded-[24px] border-2 ${activeAgentIdx === i ? "border-blue-500 bg-white shadow-xl" : "border-gray-100"}`}>
                    <div className="flex flex-col items-center gap-4">
                      {activeAgentIdx === i ? <Activity className="animate-spin text-blue-600" /> : agent.icon}
                      <h4 className="font-bold text-xs uppercase tracking-widest">{agent.name}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Synthesizing Intelligence</h3>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">{AGENTS[activeAgentIdx].name} is querying OSV.dev...</p>
            </div>
          </motion.div>
        )}

        {/* Results Phase */}
        {phase === "results" && scanResults && (
          <motion.div key="results" className="max-w-7xl mx-auto p-8 space-y-12">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-8">
                  <h2 className="text-5xl font-bold tracking-tight">Project Roadmap</h2>
                  <p className="text-xl text-gray-500">{scanResults.agents_reports.architect.summary}</p>

                  {scanResults.agents_reports.dx.steps.map((step: any, idx: number) => (
                    <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 flex gap-8 group">
                      <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-900 border border-gray-100 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold">{step.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${step.priority === "High" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                            {step.priority}
                          </span>
                        </div>
                        <p className="text-gray-500 font-medium text-sm">{step.desc}</p>
                        <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between group-hover:ring-4 ring-blue-50 transition-all">
                          <code className="text-blue-400 font-mono text-xs">$ {step.cmd}</code>
                          <button onClick={() => handleCopy(step.cmd, `dx-${idx}`)} className="text-gray-400 hover:text-white transition-colors">
                            {copiedId === `dx-${idx}` ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="col-span-4 space-y-6">
                  <div className="bg-black rounded-[32px] p-8 text-white space-y-8">
                    <div className="flex justify-between items-start">
                      <Target size={24} className="text-blue-500" />
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Health Score</span>
                        <span className="text-5xl font-bold">{scanResults.metadata.score}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${scanResults.metadata.score}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Anatomy Tab */}
            {activeTab === "anatomy" && (
              <div className="grid grid-cols-3 gap-6">
                {scanResults.agents_reports.architect.components.map((comp: any, idx: number) => (
                  <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 hover:border-blue-500 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Box size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">{comp.tier}</span>
                        <h4 className="text-lg font-bold">{comp.name}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{comp.purpose}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-8">
                {scanResults.agents_reports.security.vulnerabilities.map((v: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-[32px] p-8 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-bold">{v.pkg}</h4>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${v.severity === "Critical" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                        {v.severity}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">{v.desc}</p>
                    <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
                      <code className="text-white text-xs font-mono">$ {v.fix_command}</code>
                      <button onClick={() => handleCopy(v.fix_command, `v-${idx}`)}>
                        {copiedId === `v-${idx}` ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-red-500 text-center mt-6">{error}</p>}
    </div>
  );
}
