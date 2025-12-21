"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const statusMessages = [
    "Connecting to source...",
    "Cloning tree...",
    "Indexing manifests...",
    "Analyzing architecture...",
    "Auditing security...",
    "Gemini synthesis...",
    "Finalizing...",
];

export default function LoadingState() {
    const [loadingStep, setLoadingStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingStep((prev) =>
                prev < statusMessages.length - 1 ? prev + 1 : prev
            );
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen animate-in fade-in duration-500 px-4">
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-(--primary)/10 blur-[60px] rounded-full animate-pulse" />
                <div className="relative w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center border border-(--light-gray) overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-(--primary)/5 to-transparent" />
                    <Sparkles
                        size={32}
                        className="text-(--primary) animate-bounce"
                    />
                    <div className="absolute inset-1 border-2 border-(--primary)/10 rounded-[28px] animate-[spin_4s_linear_infinite]" />
                </div>
            </div>

            <div className="text-center space-y-4 max-w-xs">
                <h3 className="text-[18px] font-bold tracking-tight text-(--foreground) h-8 overflow-hidden">
                    <div
                        key={loadingStep}
                        className="animate-in slide-in-from-bottom-4 fade-in duration-300"
                    >
                        {statusMessages[loadingStep]}
                    </div>
                </h3>
                <div className="flex items-center gap-1.5 justify-center">
                    {statusMessages.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === loadingStep
                                    ? "w-6 bg-(--primary)"
                                    : i < loadingStep
                                        ? "w-1.5 bg-(--success)"
                                        : "w-1.5 bg-(--light-gray)"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
