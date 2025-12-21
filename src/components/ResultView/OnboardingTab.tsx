"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface OnboardingTabProps {
    onboarding: { installCmd: string; testCmd: string; runCmd: string };
}

export default function OnboardingTab({ onboarding }: OnboardingTabProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const items = [
        { label: "Setup", key: "installCmd", id: "install" },
        { label: "Testing", key: "testCmd", id: "test" },
        { label: "Start App", key: "runCmd", id: "run" },
    ];

    return (
        <div className="bg-white p-12 rounded-[40px] border border-[var(--light-gray)] grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-top-4 duration-500">
            {items.map((item) => (
                <div key={item.id} className="space-y-4">
                    <span className="text-[11px] font-bold text-[var(--gray)] uppercase tracking-widest">
                        {item.label}
                    </span>
                    <div className="group relative p-6 bg-[var(--light-bg)] rounded-2xl overflow-hidden">
                        <code className="text-[14px] font-mono font-bold text-[var(--foreground)] break-all">
                            {onboarding[item.key as keyof typeof onboarding]}
                        </code>
                        <button
                            onClick={() =>
                                handleCopy(
                                    onboarding[item.key as keyof typeof onboarding],
                                    item.id
                                )
                            }
                            className="absolute right-3 top-3 p-2 bg-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                        >
                            {copiedId === item.id ? (
                                <Check size={14} className="text-[var(--success)]" />
                            ) : (
                                <Copy size={14} className="text-[var(--gray)]" />
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}