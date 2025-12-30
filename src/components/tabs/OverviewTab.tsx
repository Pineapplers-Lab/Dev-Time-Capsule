"use client";

import { Copy, Check, Terminal } from "lucide-react";
import { useState } from "react";

export default function OverviewTab({ scanResults, copiedId, setCopiedId }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [internalCopiedId, setInternalCopiedId] = useState<string | null>(null);

    // Use internal state if setCopiedId is not provided
    const activeCopiedId = copiedId !== undefined ? copiedId : internalCopiedId;
    const setActiveCopiedId = setCopiedId || setInternalCopiedId;

    const handleCopy = (text: string, id: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setActiveCopiedId(id);
                setTimeout(() => setActiveCopiedId(null), 2000);
            });
        } else {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.top = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setActiveCopiedId(id);
            setTimeout(() => setActiveCopiedId(null), 2000);
        }
    };

    // Check if scanResults exists and has the required structure
    if (!scanResults || !scanResults.agents_reports) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-gray-500 font-medium">No scan results available</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-3 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading roadmap...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-16">

                {/* Header Section */}
                <div className="mb-16 animate-fade-in">
                    <h1 className="text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
                        Project Roadmap
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
                        {scanResults.agents_reports.architect.summary}
                    </p>
                </div>

                {/* Steps Section */}
                <div className="space-y-6">
                    {scanResults.agents_reports.dx.steps.map((step: any, idx: number) => (
                        <div
                            key={idx}
                            className="group bg-white border border-gray-200 rounded-2xl p-8 transition-all duration-300 hover:border-gray-300 hover:shadow-lg animate-slide-up"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Step Header */}
                            <div className="flex items-start gap-5 mb-4">
                                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700 transition-all duration-300 group-hover:bg-gray-900 group-hover:text-white">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {step.title}
                                        </h3>
                                        <span
                                            className={`text-xs font-semibold uppercase px-3 py-1 rounded-full transition-all duration-300 ${step.priority === "High"
                                                ? "bg-gray-100 text-gray-900"
                                                : "bg-gray-50 text-gray-600"
                                                }`}
                                        >
                                            {step.priority}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Command Section */}
                            {/* Command Section */}
                            <div className="relative bg-[#020617] rounded-xl p-4 border border-[#0f172a] transition-all duration-300 group-hover:bg-[#020617]">
                                <div className="flex items-center gap-3">
                                    <Terminal size={18} className="text-green-400 flex-shrink-0" />
                                    <code className="flex-1 text-sm font-mono text-green-400 overflow-x-auto">
                                        {step.cmd}
                                    </code>
                                    <button
                                        onClick={() => handleCopy(step.cmd, `dx-${idx}`)}
                                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#020617] border border-[#1e293b] flex items-center justify-center text-green-400 hover:text-green-300 hover:border-[#334155] transition-all duration-200 active:scale-95"
                                        aria-label="Copy command"
                                    >
                                        {copiedId === `dx-${idx}` ? (
                                            <Check size={16} className="text-green-400" />
                                        ) : (
                                            <Copy size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>


                        </div>
                    ))}
                </div>

                {/* Footer Spacing */}
                <div className="h-16" />
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s ease-out;
                    animation-fill-mode: both;
                }
            `}</style>
        </div>
    );
}