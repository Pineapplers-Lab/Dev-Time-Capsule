"use client";

import { useState } from "react";
import { Layout, Terminal, ShieldCheck, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OverviewTab from "./OverviewTab";
import OnboardingTab from "./OnboardingTab";
import SecurityTab from "./SecurityTab";
import AdvisoryTab from "./AdvisoryTab";
import Header from "../Header";

interface ResultViewProps {
  result: any;
  setView: (view: "input" | "loading" | "result") => void;
}

export default function ResultView({ result, setView }: ResultViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "onboarding" | "security" | "pavilion"
  >("overview");
  const [loadingTab, setLoadingTab] = useState(false);

  const tabs = [
    { id: "overview", icon: <Layout size={16} />, label: "Overview" },
    { id: "onboarding", icon: <Terminal size={16} />, label: "Onboarding" },
    { id: "security", icon: <ShieldCheck size={16} />, label: "Security" },
    { id: "pavilion", icon: <Compass size={16} />, label: "Pavilion" },
  ];

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setLoadingTab(true);
    setTimeout(() => {
      setActiveTab(tabId as any);
      setLoadingTab(false);
    }, 300); // small delay for loader
  };

  return (
    <div className="animate-in fade-in duration-700 px-6">
      <Header view="result" setView={setView} />

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-(--primary)/10 text-(--primary) text-[11px] font-bold uppercase tracking-widest rounded-md">
            Audit Ready
          </span>
        </div>
        <motion.h2
          key={result.projectName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold tracking-tight mb-6"
        >
          {result.projectName}
        </motion.h2>
        <motion.p
          key={result.stackDescription}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[21px] text-[var(--gray)] font-medium leading-[1.3] max-w-2xl tracking-tight"
        >
          {result.stackDescription}
        </motion.p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-white p-1.5 rounded-2xl border border-[var(--light-gray)] shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 text-[14px] font-bold transition-all rounded-xl ${activeTab === tab.id
                  ? "bg-(--primary) text-white shadow-md"
                  : "text-[var(--gray)] hover:text-black hover:bg-[var(--light-bg)]"
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px] relative">
        <AnimatePresence mode="wait">
          {loadingTab ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-96"
            >
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <OverviewTab stackDetails={result.stackDetails} />
              )}
              {activeTab === "onboarding" && (
                <OnboardingTab onboarding={result.onboarding} />
              )}
              {activeTab === "security" && (
                <SecurityTab vulnerabilities={result.vulnerabilities} />
              )}
              {activeTab === "pavilion" && (
                <AdvisoryTab advisory={result.advisory} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
