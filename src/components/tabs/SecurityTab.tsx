"use client";

import { Copy, Check, AlertCircle, Shield, Terminal, Package, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function SecurityTab({ scanResults, copiedId, setCopiedId }: any) {
    const [isLoading, setIsLoading] = useState(false);
    const [internalCopiedId, setInternalCopiedId] = useState<string | null>(null);

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

    if (!scanResults || !scanResults.agents_reports || !scanResults.agents_reports.security) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-gray-500 font-medium">No security data available</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-3 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Analyzing vulnerabilities...</p>
                </div>
            </div>
        );
    }

    const vulnerabilities = scanResults.agents_reports.security.vulnerabilities;

    const criticalVulns = vulnerabilities.filter((v: any) => v.severity === "Critical");
    const highVulns = vulnerabilities.filter((v: any) => v.severity === "High");
    const mediumVulns = vulnerabilities.filter((v: any) => v.severity === "Medium");
    const lowVulns = vulnerabilities.filter((v: any) => v.severity === "Low");

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "Critical":
                return "text-gray-900";
            case "High":
                return "text-gray-700";
            case "Medium":
                return "text-gray-500";
            default:
                return "text-gray-400";
        }
    };

    const allVulns = [...criticalVulns, ...highVulns, ...mediumVulns, ...lowVulns];

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center transition-all duration-300 hover:border-gray-300 hover:shadow-lg">
                        <div className="text-3xl font-semibold text-gray-900 mb-1">
                            {vulnerabilities.length}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Total Issues</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center transition-all duration-300 hover:border-gray-300 hover:shadow-lg">
                        <div className="text-3xl font-semibold text-gray-900 mb-1">
                            {criticalVulns.length}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Critical</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center transition-all duration-300 hover:border-gray-300 hover:shadow-lg">
                        <div className="text-3xl font-semibold text-gray-700 mb-1">
                            {highVulns.length}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">High</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center transition-all duration-300 hover:border-gray-300 hover:shadow-lg">
                        <div className="text-3xl font-semibold text-gray-500 mb-1">
                            {mediumVulns.length + lowVulns.length}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Other</div>
                    </div>
                </div>

                {/* Vulnerabilities List */}
                <div className="space-y-4">
                    {allVulns.map((vuln: any, idx: number) => {
                        const severityColor = getSeverityColor(vuln.severity);

                        return (
                            <div
                                key={idx}
                                className="group bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-500 hover:border-gray-300 hover:shadow-xl animate-slide-up"
                                style={{ animationDelay: `${idx * 60 + 200}ms` }}
                            >
                                {/* Header */}
                                <div className="flex items-start gap-4 mb-5">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/80 backdrop-blur border border-gray-200/60 flex items-center justify-center transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-sm">
                                        <Package
                                            size={20}
                                            className={severityColor}
                                            strokeWidth={1.4}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight truncate">
                                                {vuln.pkg}
                                            </h3>

                                            <span className="px-2.5 py-0.5 text-[11px] font-medium text-gray-700 bg-gray-100/80 rounded-full border border-gray-200/60">
                                                {vuln.severity}
                                            </span>
                                        </div>

                                        <p className="text-[13.5px] text-gray-600 leading-[1.6] line-clamp-2">
                                            {vuln.desc}
                                        </p>
                                    </div>
                                </div>


                                {/* Fix Section */}
                                <div className="space-y-3 pl-16">
                                    {/* Divider */}
                                    <div className="border-t border-gray-100" />

                                    {/* Fix Label */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <ArrowRight size={14} strokeWidth={2} />
                                        <span className="font-medium">Recommended fix</span>
                                    </div>

                                    {/* Command Box */}
                                    <div className="relative bg-[#020617] rounded-xl p-4 border border-[#0f172a] transition-all duration-300 group-hover:bg-[#020617]">
                                        <div className="flex items-center gap-3">
                                            <Terminal size={16} className="text-green-400 flex-shrink-0" strokeWidth={2} />
                                            <code className="flex-1 text-sm font-mono text-green-400 overflow-x-auto">
                                                {vuln.fix_command}
                                            </code>
                                            <button
                                                onClick={() => handleCopy(vuln.fix_command, `v-${idx}`)}
                                                className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#020617] border border-[#1e293b] flex items-center justify-center text-green-400 hover:text-green-300 hover:border-[#334155] transition-all duration-200 active:scale-95"
                                                aria-label="Copy command"
                                            >
                                                {activeCopiedId === `v-${idx}` ? (
                                                    <Check size={16} className="text-green-400" strokeWidth={2.5} />
                                                ) : (
                                                    <Copy size={16} strokeWidth={2} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Info Card */}
                <div className="mt-12 bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-200 mb-4">
                        <CheckCircle2 size={24} className="text-gray-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Keep Your Project Secure
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
                        Run these commands to update vulnerable packages. Address critical issues first,
                        then work through high and medium severity vulnerabilities.
                    </p>
                </div>

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

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                    animation-fill-mode: both;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    animation-fill-mode: both;
                }

                .animate-scale-in {
                    animation: scale-in 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}