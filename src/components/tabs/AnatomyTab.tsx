import { Box } from "lucide-react";

export default function AnatomyTab({ scanResults }: any) {
    return (
        <div className="grid grid-cols-3 gap-6">
            {scanResults.agents_reports.architect.components.map((comp: any, idx: number) => (
                <div
                    key={idx}
                    className="bg-white p-8 rounded-[32px] border border-gray-100 hover:border-blue-500 transition-all"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                            <Box size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-blue-600 uppercase block">
                                {comp.tier}
                            </span>
                            <h4 className="text-lg font-bold">{comp.name}</h4>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed">
                        {comp.purpose}
                    </p>
                </div>
            ))}
        </div>
    );
}
