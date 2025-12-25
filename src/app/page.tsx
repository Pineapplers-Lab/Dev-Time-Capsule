"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { View, Tab, ScanResult } from "../types";
import { AppleButton } from "../components/Buttons/AppleButton";
import { Navbar } from "../components/Navbar";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { TabSelector } from "../components/Tabs/TabSelector";
import { OnboardingTab } from "../components/Tabs/OnboardingTab";
import AnatomyTab from "../components/Tabs/AnatomyTab";
import { VulnsTab } from "../components/Tabs/VulnsTab";
import { performRealScan } from "../utils/scan";

const apiKey = "AIzaSyCsKRjtjPT4ik9UE8j5oQWluh6uIvxOoDw";
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";

export default function HomePage() {
  const [view, setView] = useState<View>('upload');
  const [activeTab, setActiveTab] = useState<Tab>('onboarding');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [scanResults, setScanResults] = useState<ScanResult | null>(null);
  const [scanStep, setScanStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    await performRealScan(
      { repoUrl },
      setScanResults,
      setView,
      setIsScanning,
      setScanStep,
      setError,
      apiKey,
      MODEL_NAME
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar view={view} setView={setView} />
      {isScanning && <LoadingOverlay scanStep={scanStep} />}

      <main className="max-w-7xl mx-auto p-6">
        {view === 'upload' && (
          <div className="flex flex-col items-center justify-center gap-6 h-[70vh]">
            <h1 className="text-5xl font-bold text-gray-900">Dev Capsule</h1>
            <p className="text-gray-500 max-w-md text-center">Enter your repository URL for a full architectural and security scan.</p>
            <input
              type="text"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="px-4 py-3 w-full max-w-lg rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <AppleButton onClick={handleScan}>Start Scan</AppleButton>
            {error && <p className="text-red-500 font-bold">{error}</p>}
          </div>
        )}

        {view === 'results' && scanResults && (
          <div className="space-y-12">
            <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === 'onboarding' && <OnboardingTab scanResults={scanResults} copiedId={copiedId} setCopiedId={setCopiedId} />}
            {activeTab === 'anatomy' && <AnatomyTab scanResults={scanResults} />}
            {activeTab === 'vulns' && <VulnsTab scanResults={scanResults} copiedId={copiedId} setCopiedId={setCopiedId} />}
          </div>
        )}
      </main>
    </div>
  );
}
