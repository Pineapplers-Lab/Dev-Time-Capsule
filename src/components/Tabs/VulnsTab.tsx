"use client";

import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle, Cpu } from "lucide-react";
import GlassCard from "../Cards/GlassCard.tsx";

interface Vulnerability {
    id: string;
    title: string;
    severity: "low" | "medium" | "high";
    description: string;
}

interface VulnsTabProps {
    vulnerabilities?: Vulnerability[];
}

export function VulnsTab({ vulnerabilities = [] }: VulnsTabProps) {
    const severityColor = (severity: Vulnerability["severity"]) => {
        if (severity === "high") return "text-red-500";
        if (severity === "medium") return "text-yellow-400";
        return "text-green-500";
    };

    return (
        <div className="space-y-6">
            <GlassCard className="p-6 bg-black text-white">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={22} />
                        <h2 className="text-lg font-semibold">
                            Vulnerability Analysis
                        </h2>
                    </div>
                    <Cpu size={20} className="text-blue-500" />
                </div>

                {vulnerabilities.length === 0 ? (
                    <div className="flex items-center gap-3 text-green-400 text-sm">
                        <CheckCircle size={18} />
                        <span>No critical vulnerabilities detected</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {vulnerabilities.map((vuln) => (
                            <motion.div
                                key={vuln.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 rounded-xl bg-white/5 border border-white/10"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-sm">
                                        {vuln.title}
                                    </h3>
                                    <span
                                        className={`text-xs font-bold uppercase ${severityColor(
                                            vuln.severity
                                        )}`}
                                    >
                                        {vuln.severity}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    {vuln.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
