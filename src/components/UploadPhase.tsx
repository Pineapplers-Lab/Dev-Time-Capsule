import { motion } from "framer-motion";
import { AGENTS } from "@/agents/agents";

export default function UploadPhase({ repoUrl, setRepoUrl, performScan }: any) {
    return (
        <motion.div className="max-w-4xl mx-auto pt-32 px-6 text-center space-y-12">
            <h1 className="text-7xl font-bold tracking-tighter leading-tight">
                Autonomous <br /><span className="text-blue-600">Code Intelligence.</span>
            </h1>

            <p className="text-xl text-gray-500 max-w-xl mx-auto font-medium">
                Three specialized AI agents auditing architecture and security.
            </p>

            <div className="relative max-w-2xl mx-auto">
                <input
                    className="w-full bg-white border-2 border-gray-100 rounded-[30px] py-6 px-8 text-lg shadow-2xl"
                    placeholder="Paste repository URL..."
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                />
                <button
                    onClick={() => performScan(repoUrl)}
                    disabled={!repoUrl}
                    className="absolute right-3 top-3 bottom-3 px-8 bg-black text-white rounded-[22px] font-bold text-sm"
                >
                    Start Audit
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-12">
                {AGENTS.map((agent, i) => (
                    <div key={i} className="p-6 bg-white border rounded-[24px] text-left space-y-4">
                        <div className={`w-10 h-10 rounded-xl bg-${agent.color}-50 text-${agent.color}-600 flex items-center justify-center`}>
                            {agent.icon}
                        </div>
                        <h4 className="font-bold text-sm">{agent.name}</h4>
                        <p className="text-xs text-gray-400">{agent.desc}</p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
