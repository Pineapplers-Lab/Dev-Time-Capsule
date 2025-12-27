"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import UploadPhase from "@/components/UploadPhase";
import LoadingPhase from "@/components/LoadingPhase";
import ResultsPhase from "@/components/ResultsPhase";
import { AGENTS } from "@/agents/agents";

type Phase = "upload" | "loading" | "results";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [activeTab, setActiveTab] = useState("overview");
  const [repoUrl, setRepoUrl] = useState("");
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentIdx, setActiveAgentIdx] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const performScan = async (url: string) => {
    setPhase("loading");
    setActiveAgentIdx(0);
    try {
      const timer = setInterval(() => {
        setActiveAgentIdx(v => (v < AGENTS.length - 1 ? v + 1 : v));
      }, 2500);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url })
      });

      clearInterval(timer);
      const data = await res.json();
      setScanResults(JSON.parse(data.content));
      setPhase("results");
    } catch {
      setError("Analysis failed. Multi-agent coordination interrupted.");
      setPhase("upload");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <Navigation phase={phase} activeTab={activeTab} setActiveTab={setActiveTab} setPhase={setPhase} />

      <AnimatePresence mode="wait">
        {phase === "upload" && <UploadPhase repoUrl={repoUrl} setRepoUrl={setRepoUrl} performScan={performScan} />}
        {phase === "loading" && <LoadingPhase activeAgentIdx={activeAgentIdx} />}
        {phase === "results" && <ResultsPhase activeTab={activeTab} scanResults={scanResults} copiedId={copiedId} setCopiedId={setCopiedId} />}
      </AnimatePresence>

      {error && <p className="text-red-500 text-center mt-6">{error}</p>}
    </div>
  );
}
