import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { AGENTS } from "@/agents/agents";

export default function LoadingPhase({ activeAgentIdx }: any) {
    return (
        <motion.div className="fixed inset-0 bg-white/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-8">
            <div className="w-full max-w-xl space-y-12 text-center">
                <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((activeAgentIdx + 1) / AGENTS.length) * 100}%` }}
                        className="h-full bg-blue-600"
                    />
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {AGENTS.map((agent, i) => (
                        <motion.div
                            key={i}
                            animate={{ scale: activeAgentIdx === i ? 1.05 : 0.95, opacity: activeAgentIdx === i ? 1 : 0.4 }}
                            className="p-6 rounded-[24px] border"
                        >
                            {activeAgentIdx === i ? <Activity className="animate-spin" /> : agent.icon}
                            <h4 className="font-bold text-xs mt-4">{agent.name}</h4>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
