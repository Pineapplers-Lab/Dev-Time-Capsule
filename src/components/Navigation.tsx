import { Box, Workflow } from "lucide-react";

export default function Navigation({ phase, activeTab, setActiveTab, setPhase }: any) {
    return (
        <nav className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 px-8 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPhase("upload")}>
                <div className="bg-black h-9 w-9 rounded-xl flex items-center justify-center">
                    <Box size={18} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">Dev Capsule</span>
            </div>

            {phase === "results" && (
                <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
                    {["overview", "anatomy", "security"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-widest ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Workflow size={14} /> OSV.DEV ENABLED
            </div>
        </nav>
    );
}
