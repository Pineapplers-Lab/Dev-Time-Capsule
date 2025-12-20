"use client";

import { useState } from "react";
import { Layout, Terminal, ShieldCheck, Compass } from "lucide-react";
import OverviewTab from "./OverviewTab";
import OnboardingTab from "./OnboardingTab";
import SecurityTab from "./SecurityTab";
import AdvisoryTab from "./AdvisoryTab";

interface ResultViewProps {
  result: any;
  setView: (view: "input" | "loading" | "result") => void;
}

export default function ResultView({ result, setView }: ResultViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "onboarding" | "security" | "pavilion"
  >("overview");

  const tabs = [
    { id: "overview", icon: <Layout size={16} />, label: "Overview" },
    { id: "onboarding", icon: <Terminal size={16} />, label: "Onboarding" },
    { id: "security", icon: <ShieldCheck size={16} />, label: "Security" },
    { id: "pavilion", icon: <Compass size={16} />, label: "Pavilion" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 bg-[var(--success)]/10 text-[var(--success)] text-[11px] font-bold uppercase tracking-widest rounded-md">
            Audit Ready
          </span>
        </div>
        <h2 className="text-5xl font-bold tracking-tight mb-6">
          {result.projectName}
        </h2>
        <p className="text-[21px] text-[var(--gray)] font-medium leading-[1.3] max-w-2xl tracking-tight">
          {result.stackDescription}
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-white p-1.5 rounded-2xl border border-[var(--light-gray)] shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 text-[14px] font-bold transition-all rounded-xl ${
                activeTab === tab.id
                  ? "bg-[#1D1D1F] text-white shadow-md"
                  : "text-[var(--gray)] hover:text-black hover:bg-[var(--light-bg)]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "overview" && <OverviewTab stackDetails={result.stackDetails} />}
        {activeTab === "onboarding" && <OnboardingTab onboarding={result.onboarding} />}
        {activeTab === "security" && <SecurityTab vulnerabilities={result.vulnerabilities} />}
        {activeTab === "pavilion" && <AdvisoryTab advisory={result.advisory} />}
      </div>
    </div>
  );
}