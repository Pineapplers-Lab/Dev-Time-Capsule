"use client";

import { motion } from "framer-motion";
import { Target, FileText, Link, Check } from "lucide-react";
import { useState } from "react";

export default function UploadPhase({ performScan, securityScore }: any) {
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <motion.div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-screen px-6 py-8 space-y-8">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-center">
        Autonomous <span className="text-blue-600">Code Intelligence</span>
      </h1>

      {/* Tab Switch */}
      <div className="flex bg-gray-100 rounded-full p-1 gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab("url")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === "url" ? "bg-white shadow text-blue-600" : "text-gray-500"
          }`}
        >
          <Link size={16} /> Repository URL
        </button>
        <button
          onClick={() => setActiveTab("file")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === "file" ? "bg-white shadow text-blue-600" : "text-gray-500"
          }`}
        >
          <FileText size={16} /> Upload File
        </button>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-2xl relative flex flex-col gap-4">
        {activeTab === "url" ? (
          <input
            type="text"
            className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 text-lg shadow-md focus:border-blue-500 transition-all"
            placeholder="Paste repository URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        ) : (
          <input
            type="file"
            accept=".zip,.tar,.gz"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border border-gray-200 rounded-[20px] py-3 px-6 text-sm"
          />
        )}
        <button
          onClick={() => performScan(repoUrl, file)}
          disabled={(activeTab === "url" && !repoUrl) || (activeTab === "file" && !file)}
          className="absolute right-3 top-3 bottom-3 bg-black text-white font-bold px-6 py-2 rounded-[20px] hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <Check size={16} /> Start Audit
        </button>
      </div>

      {/* Security Score */}
      {securityScore !== undefined && (
        <div className="flex items-center gap-3 mt-2 w-full max-w-2xl">
          <Target size={20} className="text-blue-600" />
          <div className="flex-1 flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Health Score</span>
            <div className="text-xl font-bold">{securityScore}%</div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full mt-1">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${securityScore}%` }} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
