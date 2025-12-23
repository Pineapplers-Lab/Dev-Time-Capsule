"use client";

import React, { useState, useRef } from "react";
import {
  ShieldCheck,
  Shapes,
  FolderOpen,
  FileCode,
  Globe,
  AlertCircle,
  UserPlus,
  ShieldAlert,
} from "lucide-react";

const apiKey = "YOUR_API_KEY";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

// Types
type Priority = "High" | "Medium" | "Low";

type Vulnerability = {
  package: string;
  version: string;
  severity: string;
  id: string;
  explanation: string;
  resolution: string;
  fix: string;
  reachability?: { status: string; trace: string };
};

type AnatomyItem = {
  category: string;
  component: string;
  purpose: string;
  reason_for_use: string;
  analysis: string;
  evidence: string[];
};

type OnboardingChecklistItem = {
  task: string;
  description: string;
  priority: Priority;
};

type ScanResults = {
  metadata: { onboarding_score: number };
  repo_overview: string;
  tech_stack: string[];
  onboarding_checklist: OnboardingChecklistItem[];
  anatomy: AnatomyItem[];
  vulnerabilities: Vulnerability[];
};

export default function DevCapsulePage() {
  const [view, setView] = useState<"upload" | "results">("upload");
  const [activeTab, setActiveTab] = useState<"onboarding" | "anatomy" | "vulns">(
    "onboarding"
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [scanResults, setScanResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Ensure array helper
  const ensureArray = <T,>(arr?: T | T[]): T[] => (Array.isArray(arr) ? arr : []);

  const performRealScan = async (contextData: { url: string }) => {
    setIsScanning(true);
    setScanStep("Initializing Analysis");
    setError(null);

    const systemPrompt = `
      You are a high-end technical onboarding assistant.
      Provide a clean, sophisticated breakdown of a codebase.
      Respond only in valid JSON with keys:
      metadata, repo_overview, tech_stack, onboarding_checklist, anatomy, vulnerabilities
    `;
    const userQuery = `Analyze repository: ${contextData.url}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
          }),
        }
      );

      if (!response.ok) throw new Error("API failure");
      const result = await response.json();
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error("Empty API response");

      const data: Partial<ScanResults> = JSON.parse(content);

      const sanitizedData: ScanResults = {
        metadata: data.metadata || { onboarding_score: 0 },
        repo_overview: data.repo_overview || "Analysis complete.",
        tech_stack: ensureArray(data.tech_stack),
        onboarding_checklist: ensureArray(data.onboarding_checklist),
        anatomy: ensureArray(data.anatomy),
        vulnerabilities: ensureArray(data.vulnerabilities),
      };

      setScanResults(sanitizedData);
      setTimeout(() => setView("results"), 400);
      setIsScanning(false);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
      setIsScanning(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const Navbar = () => (
    <nav className="h-14 border-b border-gray-100 bg-white/70 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => {
          setView("upload");
          setScanResults(null);
          setActiveTab("onboarding");
        }}
      >
        <div className="bg-black p-1.5 rounded-lg shadow-sm">
          <ShieldCheck size={16} className="text-white" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-black">OnboardSafe</span>
      </div>

      {view === "results" && (
        <div className="flex bg-gray-100/60 p-1 rounded-xl border border-gray-200/50">
          {[
            { id: "onboarding", Icon: UserPlus, label: "Overview" },
            { id: "anatomy", Icon: Shapes, label: "Anatomy" },
            { id: "vulns", Icon: ShieldAlert, label: "Security" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeTab === tab.id ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"
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

  if (view === "upload") {
    return (
      <div className="min-h-screen bg-[#FBFBFD] text-black antialiased">
        <Navbar />
        {isScanning && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="flex gap-1.5 mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                performRealScan({ url: repoUrl });
              }}
              className="relative flex items-center group mb-8"
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
                <input type="file" ref={folderInputRef} className="hidden" {...({ webkitdirectory: "true", directory: "" } as any)} />
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
        </main>
      </div>
    );
  }

  // RESULTS view
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-black antialiased">
      <Navbar />
      <main className="max-w-[1100px] mx-auto px-8 py-16 animate-in fade-in duration-1000 space-y-12">
        <h2 className="text-2xl font-semibold">Repository Overview</h2>
        <p className="text-gray-700">{scanResults?.repo_overview}</p>

        {/* Tech Stack */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
          <ul className="list-disc pl-6">
            {scanResults?.tech_stack.map((tech, idx) => (
              <li key={idx}>{tech}</li>
            ))}
          </ul>
        </div>

        {/* Tabs */}
        <div className="space-y-8">
          {activeTab === "onboarding" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Onboarding Checklist</h3>
              <ul className="space-y-2">
                {scanResults?.onboarding_checklist.map((item, idx) => (
                  <li key={idx} className="p-4 bg-white border rounded-xl shadow-sm flex justify-between items-center">
                    <span>
                      <strong>{item.task}</strong>: {item.description} ({item.priority})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "anatomy" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Codebase Anatomy</h3>
              {scanResults?.anatomy.map((item, idx) => (
                <div key={idx} className="p-4 bg-white border rounded-xl shadow-sm mb-4">
                  <p>
                    <strong>{item.component}</strong> ({item.category}): {item.purpose}
                  </p>
                  <p className="text-gray-500">{item.analysis}</p>
                  <ul className="list-disc pl-6">
                    {item.evidence.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "vulns" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Security Vulnerabilities</h3>
              {scanResults?.vulnerabilities.map((v, idx) => (
                <div key={idx} className="p-4 bg-white border rounded-xl shadow-sm mb-4 flex justify-between items-center">
                  <div>
                    <p>
                      <strong>{v.package}@{v.version}</strong> ({v.severity})
                    </p>
                    <p className="text-gray-500">{v.explanation}</p>
                    <p className="text-gray-500">Fix: {v.fix}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(`${v.package}@${v.version}`, v.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {copiedId === v.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
