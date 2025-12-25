"use client";

import React from "react";
import { ScanResult } from "../../types";
import GlassCard from "../Cards/GlassCard";
import {
    Terminal,
    Check,
    Copy,
    Cpu,
    Sparkles,
    ChevronRight,
    Globe
} from "lucide-react";

import { handleCopy } from "../../utils/copy";
import { getTechIcon } from "../../utils/icons";

interface Props {
    scanResults: ScanResult;
    copiedId: string | null;
    setCopiedId: (id: string | null) => void;
}

export const OnboardingTab: React.FC<Props> = ({
    scanResults,
    copiedId,
    setCopiedId
}) => {
    const ensureArray = (arr: any) =>
        Array.isArray(arr) ? arr : arr ? [arr] : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-12">
                <header className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Globe size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                            Project Overview
                        </span>
                    </div>

                    <h2 className="text-5xl font-bold tracking-tight">
                        System Roadmap
                    </h2>

                    <p className="text-xl text-[#86868B] font-medium leading-snug max-w-2xl">
                        {scanResults?.repo_overview}
                    </p>
                </header>

                <div className="space-y-8 relative">
                    <div className="absolute left-[30px] top-4 bottom-4 w-px bg-gray-100" />

                    {ensureArray(scanResults?.onboarding_checklist).map(
                        (item, idx) => (
                            <GlassCard
                                key={idx}
                                className="relative ml-16 p-8 overflow-hidden group"
                            >
                                <div className="absolute -left-[58px] top-2 flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm z-10">
                                    <span className="text-lg font-bold text-gray-900">
                                        {idx + 1}
                                    </span>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="space-y-2 max-w-md">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                            STEP 0{idx + 1}
                                        </span>

                                        <h4 className="text-2xl font-bold">
                                            {item.task}
                                        </h4>

                                        <p className="text-gray-500 font-medium text-sm leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="w-full md:w-64 space-y-3">
                                        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-2 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                            <div className="flex items-center justify-between">
                                                <Terminal
                                                    size={12}
                                                    className="text-gray-400"
                                                />
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">
                                                    CLI Action
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <code className="text-xs font-mono text-gray-700 truncate">
                                                    $ {item.command || "npm install"}
                                                </code>

                                                <button
                                                    onClick={() =>
                                                        handleCopy(
                                                            item.command ||
                                                            "npm install",
                                                            `step-${idx}`,
                                                            setCopiedId
                                                        )
                                                    }
                                                    className={`p-2 rounded-lg transition-all ${copiedId === `step-${idx}`
                                                            ? "bg-green-500 text-white"
                                                            : "bg-gray-200/50 text-gray-600 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {copiedId === `step-${idx}` ? (
                                                        <Check size={14} />
                                                    ) : (
                                                        <Copy size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        )
                    )}
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <GlassCard className="p-8 bg-black text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                        <Cpu size={120} />
                    </div>

                    <div className="relative z-10 space-y-12">
                        <div className="flex justify-between items-start">
                            <Cpu size={24} className="text-blue-500" />

                            <div className="text-right">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                                    Architecture Score
                                </span>
                                <span className="text-5xl font-bold">
                                    {scanResults?.metadata?.onboarding_score ?? 0}%
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-1 w-full bg-white/10 rounded-full">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{
                                        width: `${scanResults?.metadata?.onboarding_score ??
                                            0
                                            }%`
                                    }}
                                />
                            </div>

                            <p className="text-xs text-gray-400 font-medium">
                                Optimal score based on modularity and security
                                compliance.
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles
                            size={14}
                            className="text-blue-600"
                        />
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            Tech Stack
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {ensureArray(scanResults?.tech_stack).map(
                            (tech, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-blue-100 transition-all cursor-default"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                            {getTechIcon(tech)}
                                        </div>

                                        <span className="text-[13px] font-semibold text-gray-700">
                                            {tech}
                                        </span>
                                    </div>

                                    <ChevronRight
                                        size={14}
                                        className="text-gray-300"
                                    />
                                </div>
                            )
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
