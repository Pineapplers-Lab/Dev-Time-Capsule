"use client";

import { Copy, Check, Target } from "lucide-react";

export default function OverviewTab({ scanResults, copiedId, setCopiedId }: any) {
    const handleCopy = (text: string, id: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
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
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-start gap-12 max-w-7xl mx-auto px-6 py-8">

            {/* Left Panel: Heading & Repo Info */}
            <div className="flex-shrink-0 w-full lg:w-64 space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Project Roadmap</h2>
                <p className="text-gray-500">{scanResults.agents_reports.architect.summary}</p>
            </div>

            {/* Center Panel: Steps */}
            <div className="flex-1 flex flex-col gap-6">
                {scanResults.agents_reports.dx.steps.map((step: any, idx: number) => (
                    <div
                        key={idx}
                        className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center font-semibold border">
                                {idx + 1}
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                                <h3 className="text-gray-900 font-medium">{step.title}</h3>
                                <span
                                    className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${step.priority === "High" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                        }`}
                                >
                                    {step.priority}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm">{step.desc}</p>

                        <div className="relative bg-gray-900 rounded-xl p-3 flex justify-between items-center font-mono text-green-400">
                            <code className="overflow-x-auto text-sm">{`$ ${step.cmd}`}</code>
                            <button
                                onClick={() => handleCopy(step.cmd, `dx-${idx}`)}
                                className="ml-4 text-gray-300 hover:text-white transition"
                            >
                                {copiedId === `dx-${idx}` ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Panel: Health Score */}
            <div className="flex-shrink-0 w-full lg:w-64">
                <div className="bg-gray-900 text-white rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <Target size={20} className="text-blue-400" />
                        <div className="text-right">
                            <span className="text-xs uppercase text-gray-400 block">Health Score</span>
                            <span className="text-3xl font-bold">{scanResults.metadata.score}%</span>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full">
                        <div
                            className="h-full bg-blue-400 rounded-full transition-all"
                            style={{ width: `${scanResults.metadata.score}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
