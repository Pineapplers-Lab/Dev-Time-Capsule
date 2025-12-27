"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AGENTS } from "@/agents/agents";

export default function LoadingPhase({ activeAgentIdx }: any) {
    const [logs, setLogs] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!AGENTS[activeAgentIdx]) return;

        const agent = AGENTS[activeAgentIdx];
        const message = `>> ${agent.name}: querying ${agent.desc.toLowerCase()}...`;

        setLogs((prev) => [...prev, message]);

        // Auto-scroll to latest log
        const timer = setTimeout(() => {
            containerRef.current?.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [activeAgentIdx]);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="w-full max-w-xl flex flex-col items-start space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Audit in Progress</h2>

                    <div
                        ref={containerRef}
                        className="w-full h-80 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono text-gray-700 space-y-2"
                    >
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-between"
                            >
                                <span>{log}</span>
                                {i === logs.length - 1 && (
                                    <motion.span
                                        className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="text-gray-500 text-sm mt-2">
                        {AGENTS[activeAgentIdx]
                            ? `Currently processing: ${AGENTS[activeAgentIdx].name}`
                            : "Initializing agents..."}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
